import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /bonuses - List user's bonuses
router.get('/', authenticateToken, async (req, res) => {
    try {
        const bonuses = await prisma.bonus.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            include: { sourceUser: { select: { firstName: true, lastName: true, email: true } } }
        });
        res.json(bonuses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch bonuses' });
    }
});

// GET /bonuses/pending - List pending bonuses (admin)
router.get('/pending', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const pendingBonuses = await prisma.bonus.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
            include: { 
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                sourceUser: { select: { firstName: true, lastName: true } }
            }
        });
        res.json(pendingBonuses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pending bonuses' });
    }
});

// POST /bonuses/process - Process pending bonuses (admin)
router.post('/process', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { bonusIds } = req.body;
        
        if (!bonusIds || !Array.isArray(bonusIds) || bonusIds.length === 0) {
            return res.status(400).json({ error: 'Please provide bonus IDs to process' });
        }

        const processed = await prisma.bonus.updateMany({
            where: { 
                id: { in: bonusIds },
                status: 'PENDING'
            },
            data: {
                status: 'PROCESSED',
                processedAt: new Date()
            }
        });

        res.json({ 
            message: `Successfully processed ${processed.count} bonuses`,
            processedCount: processed.count 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process bonuses' });
    }
});

export default router;
