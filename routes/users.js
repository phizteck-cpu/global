import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /users/me - Get Profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                tier: true,
                contributions: { orderBy: { weekNumber: 'asc' } },
                transactions: { orderBy: { createdAt: 'desc' }, take: 20 }
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Remove sensitive fields before sending
        const { password, transactionPin, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Update Profile General Info
router.patch('/me', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(phone && { phone })
            }
        });
        const { password, transactionPin, ...safeUser } = updatedUser;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Change Password
router.post('/me/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect current password' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Update Transaction PIN
router.post('/me/update-pin', authenticateToken, async (req, res) => {
    try {
        const { currentPin, newPin, password } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });

        // Verify password for security if PIN is being set/changed
        const isPassMatch = await bcrypt.compare(password, user.password);
        if (!isPassMatch) return res.status(400).json({ error: 'Incorrect password' });

        // If user already has a PIN, verify current PIN
        if (user.transactionPin) {
            const isPinMatch = await bcrypt.compare(currentPin, user.transactionPin);
            if (!isPinMatch) return res.status(400).json({ error: 'Incorrect current PIN' });
        }

        const hashedPin = await bcrypt.hash(newPin, 10);
        await prisma.user.update({
            where: { id: req.user.userId },
            data: { transactionPin: hashedPin }
        });

        res.json({ message: 'Transaction PIN updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update PIN' });
    }
});

// POST /users/me/kyc - Upload KYC
router.post('/me/kyc', authenticateToken, async (req, res) => {
    try {
        const { kycDocUrl } = req.body;
        await prisma.user.update({
            where: { id: req.user.userId },
            data: {
                kycDocUrl,
                kycStatus: 'PENDING'
            }
        });
        res.json({ message: 'KYC document uploaded', status: 'PENDING' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload KYC' });
    }
});

export default router;
