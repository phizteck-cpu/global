import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';

const router = express.Router();

import { authenticateToken as auth } from '../middleware/auth.js';

// Get User Stats
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                tier: true,
                _count: {
                    select: {
                        contributions: {
                            where: { status: 'PAID' }
                        }
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        const weeksCompleted = user._count.contributions;
        const totalWeeks = 45; // Fixed as per requirements

        // Lock Logic (7 months from join date)
        const joinDate = new Date(user.joinDate);
        const lockEndDate = new Date(joinDate.getTime());
        lockEndDate.setMonth(lockEndDate.getMonth() + 7);

        const now = new Date();
        const isLocked = now < lockEndDate;
        const daysRemaining = isLocked ? Math.ceil((lockEndDate - now) / (1000 * 60 * 60 * 24)) : 0;

        let eligibilityStatus = 'IN_PROGRESS';
        if (isLocked) {
            eligibilityStatus = 'LOCKED';
        } else if (weeksCompleted >= totalWeeks) {
            eligibilityStatus = 'ELIGIBLE';
        }

        res.json({
            contributionBalance: user.contributionBalance,
            bvBalance: user.bvBalance,
            walletBalance: user.walletBalance,
            tier: user.tier ? user.tier.name : 'NO_PACKAGE',
            weeksCompleted,
            totalWeeks,
            daysRemainingInLock: daysRemaining,
            eligibilityStatus,
            memberId: user.referralCode,
            status: user.status
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent transactions
router.get('/transactions', auth, async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user.userId },
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
