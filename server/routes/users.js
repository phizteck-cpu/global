import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET /users/me - Get Profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                wallet: true,
                userPackages: {
                    where: { status: 'ACTIVE' },
                    include: { package: true }
                }
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Remove password before sending
        const { password, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /users/me - Update Profile
router.post('/me', authenticateToken, async (req, res) => { // Using POST for simpler form handling if needed, or PUT
    try {
        const { fullName, phone } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: { fullName, phone }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// POST /users/me/kyc - Upload KYC
router.post('/me/kyc', authenticateToken, async (req, res) => {
    try {
        const { kycDocUrl } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                kycDocUrl,
                status: 'PENDING' // Set to pending verification if kyc uploaded
            }
        });
        res.json({ message: 'KYC document uploaded', status: 'PENDING' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload KYC' });
    }
});

export default router;
