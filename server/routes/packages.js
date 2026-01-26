import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isSuperAdmin, isOps } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/packages - List Available Membership Tiers
router.get('/', async (req, res) => {
    try {
        const tiers = await prisma.tier.findMany({
            orderBy: { onboardingFee: 'asc' }
        });
        res.json(tiers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch membership tiers' });
    }
});

// POST /api/packages/upgrade - Upgrade Membership Tier
router.post('/upgrade', authenticateToken, async (req, res) => {
    try {
        const { tierId } = req.body;
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { tier: true }
        });
        const newTier = await prisma.tier.findUnique({ where: { id: parseInt(tierId) } });

        if (!newTier) return res.status(404).json({ error: 'Tier not found' });

        // Tier upgrade logic
        const upgradeFee = newTier.upgradeFee;

        if (user.walletBalance < upgradeFee) {
            return res.status(400).json({ error: `Insufficient balance for upgrade. Required: ₦${upgradeFee}` });
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    tierId: newTier.id,
                    walletBalance: { decrement: upgradeFee }
                }
            });

            await tx.transaction.create({
                data: {
                    userId,
                    amount: upgradeFee,
                    type: 'UPGRADE_FEE',
                    ledgerType: 'COMPANY',
                    direction: 'IN',
                    status: 'SUCCESS',
                    description: `Upgrade from ${user.tier?.name || 'NONE'} to ${newTier.name}`,
                    reference: `UPG-${userId}-${Date.now()}`
                }
            });
        });

        res.json({ message: `Successfully upgraded to ${newTier.name} tier` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Upgrade failed' });
    }
});

// Admin Control: Add/Update Tier
router.post('/', authenticateToken, isOps, async (req, res) => {
    try {
        const { name, weeklyAmount, onboardingFee, maintenanceFee, upgradeFee, maxWithdrawal, bvThreshold } = req.body;
        const tier = await prisma.tier.upsert({
            where: { name },
            update: {
                weeklyAmount: parseFloat(weeklyAmount),
                onboardingFee: parseFloat(onboardingFee),
                maintenanceFee: parseFloat(maintenanceFee),
                upgradeFee: parseFloat(upgradeFee),
                maxWithdrawal: maxWithdrawal ? parseFloat(maxWithdrawal) : null,
                bvThreshold: bvThreshold ? parseFloat(bvThreshold) : null
            },
            create: {
                name,
                weeklyAmount: parseFloat(weeklyAmount),
                onboardingFee: parseFloat(onboardingFee),
                maintenanceFee: parseFloat(maintenanceFee),
                upgradeFee: parseFloat(upgradeFee),
                maxWithdrawal: maxWithdrawal ? parseFloat(maxWithdrawal) : null,
                bvThreshold: bvThreshold ? parseFloat(bvThreshold) : null
            }
        });
        res.status(201).json(tier);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to manage tier' });
    }
});

export default router;
