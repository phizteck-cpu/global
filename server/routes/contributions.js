import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';
import { processReferralBonus } from '../utils/referralSystem.js';

const prisma = new PrismaClient();
const router = express.Router();

// Get Contribution History
router.get('/', authenticateToken, async (req, res) => {
    try {
        const contributions = await prisma.contribution.findMany({
            where: { userId: req.user.userId },
            orderBy: { weekNumber: 'asc' }
        });
        res.json(contributions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
});

// Pay Contribution
router.post('/pay', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { tier: true }
        });

        if (!user.tier) {
            return res.status(400).json({ error: 'No active tier found. Please select a tier first.' });
        }

        const amount = user.tier.weeklyAmount;
        const maintenanceFee = user.tier.maintenanceFee;
        const totalToDeduct = amount + maintenanceFee;

        // Check wallet balance
        if (user.walletBalance < totalToDeduct) {
            return res.status(400).json({ error: 'Insufficient wallet balance. Please fund your wallet first.' });
        }

        // Find next contribution week
        const lastContribution = await prisma.contribution.findFirst({
            where: { userId },
            orderBy: { weekNumber: 'desc' }
        });
        const nextWeek = lastContribution ? lastContribution.weekNumber + 1 : 1;

        if (nextWeek > 45) {
            return res.status(400).json({ error: 'You have completed all 45 weeks of contributions.' });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Update User Balances
            await tx.user.update({
                where: { id: userId },
                data: {
                    walletBalance: { decrement: totalToDeduct },
                    contributionBalance: { increment: amount },
                    bvBalance: { increment: amount }, // BV accumulates with activity
                }
            });

            // 2. Log Cooperative Transaction
            await tx.transaction.create({
                data: {
                    userId,
                    amount,
                    type: 'CONTRIBUTION',
                    ledgerType: 'COOPERATIVE',
                    direction: 'IN',
                    status: 'SUCCESS',
                    description: `Week ${nextWeek} Contribution`,
                    reference: `CON-${userId}-WK${nextWeek}-${Date.now()}`
                }
            });

            // 3. Log Company Maintenance Fee
            if (maintenanceFee > 0) {
                await tx.transaction.create({
                    data: {
                        userId,
                        amount: maintenanceFee,
                        type: 'MAINTENANCE_FEE',
                        ledgerType: 'COMPANY',
                        direction: 'IN',
                        status: 'SUCCESS',
                        description: `Week ${nextWeek} Maintenance Fee`,
                        reference: `MNT-${userId}-WK${nextWeek}-${Date.now()}`
                    }
                });
            }

            // 4. Create Contribution Record
            await tx.contribution.create({
                data: {
                    userId,
                    weekNumber: nextWeek,
                    amount,
                    status: 'PAID'
                }
            });
        });

        res.json({ message: `Week ${nextWeek} contribution successful`, week: nextWeek });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment failed' });
    }
});

export default router;
