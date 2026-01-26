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

// Mock SMS
const sendSMS = (phone, message) => {
    console.log(`[SMS GATEWAY] To: ${phone} | Msg: ${message}`);
};


// Pay Next Contribution (Manual Trigger)
router.post('/pay', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find Active Package and Wallet
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                wallet: true,
                userPackages: {
                    where: { status: 'ACTIVE' },
                    include: { package: true }
                }
            }
        });

        const activeSub = user.userPackages[0];
        if (!activeSub) {
            return res.status(400).json({ error: 'No active package found. Please subscribe first.' });
        }

        const pkg = activeSub.package;
        const amount = pkg.weeklyAmount;

        // Find the next PENDING contribution in the schedule
        const nextContribution = await prisma.contribution.findFirst({
            where: {
                userPackageId: activeSub.id,
                status: 'PENDING'
            },
            orderBy: { weekNumber: 'asc' }
        });

        if (!nextContribution) {
            return res.status(400).json({ error: 'No pending contributions found for this cycle.' });
        }

        if (user.wallet.balance < amount) {
            return res.status(400).json({ error: 'Insufficient available balance. Please fund your wallet.' });
        }

        const nextWeek = nextContribution.weekNumber;

        // Execute Payment in Transaction
        await prisma.$transaction(async (tx) => {
            // 1. Update Wallet Balances
            await tx.wallet.update({
                where: { userId },
                data: {
                    balance: { decrement: amount },
                    lockedBalance: { increment: amount }
                }
            });

            // 2. Log Transaction
            await tx.transaction.create({
                data: {
                    walletId: user.wallet.id,
                    type: 'CONTRIBUTION',
                    amount,
                    status: 'SUCCESS',
                    description: `Week ${nextWeek} Manual Contribution for ${pkg.name}`,
                    reference: `CON-MAN-${userId}-WK${nextWeek}-${Date.now()}`
                }
            });

            // 3. Mark Contribution as PAID
            await tx.contribution.update({
                where: { id: nextContribution.id },
                data: {
                    status: 'PAID',
                    paidAt: new Date()
                }
            });

            // 4. Update Subscription Progress
            await tx.userPackage.update({
                where: { id: activeSub.id },
                data: { weeksPaid: { increment: 1 } }
            });

            // 5. Referral Check (Only on first contribution)
            if (nextWeek === 1) {
                await processReferralBonus(userId, tx);
            }
        });

        // Mock SMS
        sendSMS(user.phone || '000', `ValueHills: Week ${nextWeek} manual payment of N${amount} successful. Total Savings: N${user.wallet.lockedBalance + amount}`);

        res.json({ message: `Week ${nextWeek} contribution successful`, week: nextWeek });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Payment failed' });
    }
});

export default router;
