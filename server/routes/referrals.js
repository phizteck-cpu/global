import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /referrals - My Referrals
router.get('/', authenticateToken, async (req, res) => {
    try {
        const referrals = await prisma.referral.findMany({
            where: { referrerId: req.user.userId },
            include: { refereeUser: { select: { fullName: true, email: true, createdAt: true } } }
        });
        res.json(referrals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch referrals' });
    }
});

// GET /referrals/stats - Referral Stats
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const totalReferrals = await prisma.referral.count({ where: { referrerId: userId } });
        const pendingReferrals = await prisma.referral.count({ where: { referrerId: userId, status: 'PENDING' } });
        const paidReferrals = await prisma.referral.count({ where: { referrerId: userId, status: 'PAID' } });

        const totalBonus = await prisma.bonus.aggregate({
            where: { userId, type: 'DIRECT' },
            _sum: { amount: true }
        });

        res.json({
            totalReferrals,
            pendingReferrals,
            paidReferrals,
            totalBonusEarned: totalBonus._sum.amount || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
});

export default router;
