import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /bonuses - Bonus History
router.get('/', authenticateToken, async (req, res) => {
    try {
        const bonuses = await prisma.bonus.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            include: { sourceUser: { select: { fullName: true } } }
        });
        res.json(bonuses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bonus history' });
    }
});

export default router;
