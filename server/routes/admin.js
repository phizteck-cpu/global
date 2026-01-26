import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isSuperAdmin, isAdmin, isFinance, isOps, anyAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Admin Stats
router.get('/stats', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count({ where: { role: 'MEMBER' } });

        // Sum total cooperative assets (Cooperative Ledger)
        const totalAssets = await prisma.user.aggregate({
            _sum: { contributionBalance: true }
        });

        // Pending Withdrawals
        const pendingApprovals = await prisma.withdrawal.count({
            where: { status: 'PENDING' }
        });

        // Company Revenue (Transactions in COMPANY ledger)
        const companyRevenue = await prisma.transaction.aggregate({
            where: { ledgerType: 'COMPANY', status: 'SUCCESS' },
            _sum: { amount: true }
        });

        res.json({
            totalUsers,
            totalAssets: totalAssets._sum.contributionBalance || 0,
            pendingApprovals,
            companyRevenue: companyRevenue._sum.amount || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Recent Users
router.get('/users', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                tier: true,
                _count: {
                    select: { contributions: { where: { status: 'PAID' } } }
                }
            }
        });
        res.json(users);
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
                admin: { select: { email: true, firstName: true, lastName: true } },
                targetUser: { select: { email: true, firstName: true, lastName: true } }
            }
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// Admin Control: Get Full Member Profile
router.get('/users/:id', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                tier: true,
                contributions: { orderBy: { weekNumber: 'asc' } },
                transactions: { orderBy: { createdAt: 'desc' }, take: 20 }
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
router.patch('/users/:id/status', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, kycStatus } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                ...(status && { status }),
                ...(kycStatus && { kycStatus })
            }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'UPDATE_USER_STATUS',
                details: `Updated user ${id} status: ${status}, KYC: ${kycStatus}`,
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
                adminId: req.user.id,
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
            { userId: user.id, role: user.role, isImpersonated: true, adminId: req.user.id },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1h' }
        );

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'IMPERSONATE_USER',
                details: `Started impersonation of user ${user.email}`,
                targetUserId: user.id
            }
        });

        res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isImpersonating: true } });
    } catch (error) {
        res.status(500).json({ error: 'Impersonation failed' });
    }
});

export default router;
