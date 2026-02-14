import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /referrals - List user's referrals
router.get('/', authenticateToken, async (req, res) => {
    try {
        const referrals = await prisma.referral.findMany({
            where: { referrerId: req.user.userId },
            include: { 
                referred: { select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, status: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(referrals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch referrals' });
    }
});

// GET /referrals/stats - Get referral statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const totalReferrals = await prisma.referral.count({ where: { referrerId: userId } });
        const pendingReferrals = await prisma.referral.count({ where: { referrerId: userId, status: 'PENDING' } });
        const activeReferrals = await prisma.referral.count({ where: { referrerId: userId, status: 'ACTIVE' } });
        const completedReferrals = await prisma.referral.count({ where: { referrerId: userId, status: 'COMPLETED' } });

        // Calculate total bonus earned from referrals
        const referralBonus = await prisma.bonus.aggregate({
            where: { userId, type: 'REFERRAL' },
            _sum: { amount: true }
        });

        const bvBonus = await prisma.bonus.aggregate({
            where: { userId, type: 'BV_BONUS' },
            _sum: { amount: true }
        });

        const matchingBonus = await prisma.bonus.aggregate({
            where: { userId, type: 'MATCHING' },
            _sum: { amount: true }
        });

        res.json({
            totalReferrals,
            pendingReferrals,
            activeReferrals,
            completedReferrals,
            totalBonusEarned: (referralBonus._sum.amount || 0) + (bvBonus._sum.amount || 0) + (matchingBonus._sum.amount || 0),
            breakdown: {
                referral: referralBonus._sum.amount || 0,
                bv: bvBonus._sum.amount || 0,
                matching: matchingBonus._sum.amount || 0
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch referral stats' });
    }
});

// GET /referrals/tree - Get referral tree (recursive)
router.get('/tree', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get the user's referral code
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true, firstName: true, lastName: true }
        });

        // Build recursive referral tree
        const buildTree = async (referrerId, level = 1) => {
            if (level > 3) return []; // Limit to 3 levels
            
            const referrals = await prisma.referral.findMany({
                where: { referrerId },
                include: {
                    referred: {
                        select: { 
                            id: true, 
                            firstName: true, 
                            lastName: true, 
                            email: true,
                            createdAt: true,
                            status: true,
                            tier: { select: { name: true } }
                        }
                    }
                }
            });

            const tree = [];
            for (const ref of referrals) {
                const children = await buildTree(ref.referredId, level + 1);
                tree.push({
                    id: ref.referred.id,
                    name: `${ref.referred.firstName} ${ref.referred.lastName}`,
                    email: ref.referred.email,
                    joinedAt: ref.referred.createdAt,
                    status: ref.referred.status,
                    tier: ref.referred.tier?.name || 'None',
                    level: ref.level,
                    bonusPaid: ref.bonusPaid,
                    children: children.length > 0 ? children : undefined
                });
            }
            
            return tree;
        };

        const referralTree = await buildTree(userId);

        res.json({
            user: {
                referralCode: user.referralCode,
                name: `${user.firstName} ${user.lastName}`
            },
            tree: referralTree
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch referral tree' });
    }
});

export default router;
