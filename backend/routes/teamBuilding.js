import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken, anyAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/team-building/stats - Get team building overview for admin
 * Shows member qualification status and chain tracking
 */
router.get('/stats', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const totalMembers = await prisma.user.count();
        const qualifiedMembers = await prisma.user.count({
            where: { qualificationStatus: 'QUALIFIED' }
        });
        const pendingMembers = await prisma.user.count({
            where: { qualificationStatus: 'PENDING' }
        });
        const disqualifiedMembers = await prisma.user.count({
            where: { qualificationStatus: 'DISQUALIFIED' }
        });

        res.json({
            totalMembers,
            qualifiedMembers,
            pendingMembers,
            disqualifiedMembers,
            qualificationRate: totalMembers > 0 ? ((qualifiedMembers / totalMembers) * 100).toFixed(2) : 0
        });
    } catch (error) {
        console.error('Error fetching team building stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

/**
 * GET /api/team-building/members - List all members with qualification status
 * For admin overview
 */
router.get('/members', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = status ? { qualificationStatus: status } : {};

        const members = await prisma.user.findMany({
            where,
            skip,
            take: parseInt(limit),
            select: {
                id: true,
                username: true,
                email: true,
                qualificationStatus: true,
                createdAt: true,
                referralCode: true,
                referredByCode: true
            },
            orderBy: { createdAt: 'desc' }
        });

        const total = await prisma.user.count({ where });

        res.json({
            members,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Server error fetching members' });
    }
});

/**
 * GET /api/team-building/chain/:userId - Get the chain/team for a specific user
 * Shows the upline chain and downline structure
 */
router.get('/chain/:userId', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        // Get the user and their upline chain
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: {
                referredBy: {
                    select: { id: true, username: true, email: true, qualificationStatus: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Build upline chain
        const uplineChain = [];
        let current = user.referredBy;
        while (current) {
            uplineChain.push(current);
            const next = await prisma.user.findUnique({
                where: { id: current.id },
                select: { id: true, referredBy: { select: { id: true, username: true, email: true, qualificationStatus: true } } }
            });
            current = next?.referredBy;
        }

        // Get direct referrals (downline)
        const directReferrals = await prisma.user.findMany({
            where: { referredByCode: user.referralCode },
            select: {
                id: true,
                username: true,
                email: true,
                qualificationStatus: true,
                createdAt: true
            }
        });

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                qualificationStatus: user.qualificationStatus,
                referralCode: user.referralCode
            },
            uplineChain: uplineChain.reverse(), // Reverse to show from top to immediate parent
            directReferrals
        });
    } catch (error) {
        console.error('Error fetching chain:', error);
        res.status(500).json({ message: 'Server error fetching chain' });
    }
});

/**
 * PUT /api/team-building/qualify/:userId - Update member qualification status
 */
router.put('/qualify/:userId', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!['QUALIFIED', 'PENDING', 'DISQUALIFIED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be QUALIFIED, PENDING, or DISQUALIFIED' });
        }

        const user = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: { qualificationStatus: status }
        });

        res.json({
            message: `User qualification status updated to ${status}`,
            user: {
                id: user.id,
                username: user.username,
                qualificationStatus: user.qualificationStatus
            }
        });
    } catch (error) {
        console.error('Error updating qualification:', error);
        res.status(500).json({ message: 'Server error updating qualification' });
    }
});

/**
 * GET /api/team-building/qualification-breakdown - Get qualification breakdown by date
 */
router.get('/qualification-breakdown', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const breakdown = await prisma.user.groupBy({
            by: ['qualificationStatus'],
            _count: { id: true }
        });

        const recentQualifications = await prisma.user.count({
            where: {
                qualificationStatus: 'QUALIFIED',
                updatedAt: { gte: thirtyDaysAgo }
            }
        });

        res.json({
            breakdown: breakdown.map(item => ({
                status: item.qualificationStatus,
                count: item._count.id
            })),
            recentQualifications
        });
    } catch (error) {
        console.error('Error fetching qualification breakdown:', error);
        res.status(500).json({ message: 'Server error fetching breakdown' });
    }
});

export default router;
