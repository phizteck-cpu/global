import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

import { authenticateToken as auth } from '../middleware/auth.js';

// Get User Stats
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                wallet: true,
                userPackages: {
                    where: { status: 'ACTIVE' },
                    include: {
                        package: true,
                        contributions: {
                            where: { status: 'PAID' }
                        }
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get Active Subscription
        const activeSub = user.userPackages[0];
        const currentPackage = activeSub?.package;

        // Calculate stats
        const walletBalance = user.wallet?.balance || 0;
        const totalSavings = user.wallet?.lockedBalance || 0;

        const weeksCompleted = activeSub ? activeSub.contributions.length : 0;
        const totalWeeks = currentPackage ? currentPackage.durationWeeks : 45;

        // Lock Logic (using subscription start date)
        const joinDate = activeSub ? new Date(activeSub.startDate) : new Date(user.createdAt);
        const lockEndDate = new Date(joinDate.setMonth(joinDate.getMonth() + 7));
        const now = new Date();
        const isLocked = now < lockEndDate;
        const daysRemaining = isLocked ? Math.ceil((lockEndDate - now) / (1000 * 60 * 60 * 24)) : 0;

        let eligibilityStatus = 'LOCKED';
        if (!isLocked) {
            eligibilityStatus = weeksCompleted >= totalWeeks ? 'ELIGIBLE' : 'IN_PROGRESS';
        }

        res.json({
            contributionBalance: totalSavings,
            bvBalance: totalSavings, // Simplified BV = Savings for now
            walletBalance: walletBalance,
            tier: currentPackage ? currentPackage.name : 'NO_PACKAGE',
            weeksCompleted,
            totalWeeks,
            daysRemainingInLock: daysRemaining,
            eligibilityStatus,
            memberId: user.referralCode
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent transactions
router.get('/transactions', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { wallet: true }
        });

        if (!user || !user.wallet) return res.json([]);

        const transactions = await prisma.transaction.findMany({
            where: { walletId: user.wallet.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
