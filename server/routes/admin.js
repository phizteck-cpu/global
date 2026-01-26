import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isSuperAdmin, isFinance, isOps, isSupportAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Admin Stats
router.get('/stats', authenticateToken, isSupportAdmin, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count({ where: { role: 'MEMBER' } });

        // Sum total cooperative assets (Locked Balances in All Wallets)
        const totalAssets = await prisma.wallet.aggregate({
            _sum: { lockedBalance: true }
        });

        // Pending Withdrawals (Transactions of type WITHDRAWAL and status PENDING)
        const pendingApprovals = await prisma.transaction.count({
            where: { type: 'WITHDRAWAL', status: 'PENDING' }
        });

        // Company Revenue (Admin Fees, Upgrade Fees, etc.)
        const companyRevenue = await prisma.transaction.aggregate({
            where: { type: { in: ['ADMIN_FEE', 'UPGRADE_FEE'] }, status: 'SUCCESS' },
            _sum: { amount: true }
        });

        res.json({
            totalUsers,
            totalAssets: totalAssets._sum.lockedBalance || 0,
            pendingApprovals,
            companyRevenue: companyRevenue._sum.amount || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Recent Users
router.get('/users', authenticateToken, isSupportAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                userPackages: {
                    where: { status: 'ACTIVE' },
                    include: { package: true }
                },
                wallet: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Pending Withdrawal Requests (Approvals)
router.get('/approvals', authenticateToken, isFinance, async (req, res) => {
    try {
        const requests = await prisma.transaction.findMany({
            where: { type: 'WITHDRAWAL', status: 'PENDING' },
            include: {
                wallet: {
                    include: {
                        user: { select: { fullName: true, email: true } }
                    }
                }
            }
        });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Audit Logs
router.get('/audit-logs', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50,
            include: {
                admin: { select: { email: true, fullName: true } },
                targetUser: { select: { email: true, fullName: true } }
            }
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// Admin: Get All Redemption Requests
router.get('/redemptions', authenticateToken, isOps, async (req, res) => {
    try {
        const requests = await prisma.redemption.findMany({
            include: { user: { select: { fullName: true, email: true, phone: true } } },
            orderBy: { requestDate: 'desc' }
        });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch redemptions' });
    }
});

// Admin: Update Redemption Status
router.post('/redemptions/:id/status', authenticateToken, isOps, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        await prisma.redemption.update({
            where: { id: parseInt(id) },
            data: {
                status,
                processedDate: new Date()
            }
        });

        // Log Audit
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userId,
                action: 'UPDATE_REDEMPTION',
                details: `Updated Redemption #${id} to ${status}`,
                targetUserId: null
            }
        });

        res.json({ message: 'Status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// Admin Control: Get Full Member Profile
router.get('/users/:id', authenticateToken, isSupportAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                wallet: true,
                userPackages: {
                    include: { package: true, contributions: true }
                },
                referrals: {
                    include: { refereeUser: { select: { fullName: true, email: true } } }
                }
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { password, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

// Admin Control: Patch User Status/KYC
router.patch('/users/:id/status', authenticateToken, isSupportAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, kycVerified } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                ...(status && { status }),
                ...(kycVerified !== undefined && { kycVerified })
            }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.userId,
                action: 'UPDATE_USER_STATUS',
                details: `Updated user ${id} status: ${status}, KYC: ${kycVerified}`,
                targetUserId: parseInt(id)
            }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

// Super Admin Control: Update Role
router.patch('/users/:id/role', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.userId,
                action: 'UPDATE_USER_ROLE',
                details: `Changed user ${id} role to ${role}`,
                targetUserId: parseInt(id)
            }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
});

import jwt from 'jsonwebtoken';

// Super Admin Control: Impersonate Member
router.post('/impersonate/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = jwt.sign(
            { userId: user.id, role: user.role, isImpersonated: true, adminId: req.user.userId },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1h' }
        );

        await prisma.auditLog.create({
            data: {
                adminId: req.user.userId,
                action: 'IMPERSONATE_USER',
                details: `Started impersonation of user ${user.email}`,
                targetUserId: user.id
            }
        });

        res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, isImpersonating: true } });
    } catch (error) {
        res.status(500).json({ error: 'Impersonation failed' });
    }
});

export default router;
