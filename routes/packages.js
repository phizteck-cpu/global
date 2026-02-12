import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        console.log('GET /api/packages called - returning Tiers for frontend compatibility');
        const tiers = await prisma.tier.findMany({
            orderBy: { onboardingFee: 'asc' }
        });
        res.json(tiers);
    } catch (error) {
        console.error('Error in GET /api/packages:', error);
        res.status(500).json({ error: 'Failed to fetch tiers' });
    }
});

// GET /packages/:id - Get package details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pkg = await prisma.package.findUnique({
            where: { id: parseInt(id) }
        });

        if (!pkg) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.json(pkg);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch package details' });
    }
});

// POST /packages - Create package or tier (admin)
router.post('/', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { name, description, price, bvValue, durationWeeks, maxQuantity, imageUrl, weeklyAmount, upgradeFee, maintenanceFee } = req.body;

        // If it's a Tier request from AdminPackages.jsx
        if (weeklyAmount !== undefined || upgradeFee !== undefined) {
            console.log('Detected Tier creation request for:', name);
            const tier = await prisma.tier.create({
                data: {
                    name,
                    weeklyAmount: parseFloat(weeklyAmount) || 0,
                    upgradeFee: parseFloat(upgradeFee) || 0,
                    maintenanceFee: parseFloat(maintenanceFee) || 0,
                    onboardingFee: parseFloat(upgradeFee) || 0,
                    durationWeeks: parseInt(durationWeeks) || 45
                }
            });
            return res.status(201).json(tier);
        }

        const pkg = await prisma.package.create({
            data: {
                name,
                description: description || null,
                price: parseFloat(price) || 0,
                bvValue: parseFloat(bvValue) || 0,
                durationWeeks: parseInt(durationWeeks) || 0,
                maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
                imageUrl: imageUrl || null,
                isActive: true
            }
        });

        res.status(201).json(pkg);
    } catch (error) {
        console.error('Error in POST /api/packages:', error);
        res.status(500).json({ error: 'Failed to create entry: ' + error.message });
    }
});

// PUT /packages/:id - Update package (admin)
router.put('/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, bvValue, durationWeeks, maxQuantity, imageUrl, isActive } = req.body;

        const pkg = await prisma.package.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description: description || null,
                price: parseFloat(price),
                bvValue: parseFloat(bvValue) || 0,
                durationWeeks: parseInt(durationWeeks) || 0,
                maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
                imageUrl: imageUrl || null,
                isActive: isActive !== undefined ? Boolean(isActive) : true
            }
        });

        res.json(pkg);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update package' });
    }
});

// DELETE /packages/:id - Delete package (admin)
router.delete('/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        // Check if package has any redemptions
        const redemptionCount = await prisma.redemption.count({
            where: { packageId: parseInt(id) }
        });

        if (redemptionCount > 0) {
            // Soft delete by deactivating instead
            await prisma.package.update({
                where: { id: parseInt(id) },
                data: { isActive: false }
            });
            return res.json({ message: 'Package deactivated (has existing redemptions)' });
        }

        await prisma.package.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete package' });
    }
});

// GET /packages/tiers/list - List all tiers (for membership upgrades)
router.get('/tiers/list', async (req, res) => {
    try {
        const tiers = await prisma.tier.findMany({
            orderBy: { onboardingFee: 'asc' }
        });
        res.json(tiers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch tiers' });
    }
});

// POST /packages/select - Select/upgrade tier
router.post('/select', authenticateToken, async (req, res) => {
    try {
        const { tierId } = req.body;
        const userId = req.user.userId;

        const tier = await prisma.tier.findUnique({
            where: { id: parseInt(tierId) }
        });

        if (!tier) {
            return res.status(404).json({ error: 'Tier not found' });
        }

        // Update user's tier
        await prisma.user.update({
            where: { id: userId },
            data: { tierId: tier.id }
        });

        res.json({ message: `Successfully selected ${tier.name} tier`, tier });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to select tier' });
    }
});

// POST /packages/upgrade/:id - Upgrade to a specific tier
router.post('/upgrade/:id', authenticateToken, async (req, res) => {
    try {
        const tierId = parseInt(req.params.id);
        const userId = req.user.userId;

        const [user, tier] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.tier.findUnique({ where: { id: tierId } })
        ]);

        if (!user) return res.status(404).json({ error: 'User not found' });
        if (!tier) return res.status(404).json({ error: 'Tier not found' });

        const upgradeFee = tier.upgradeFee || 0;

        if (user.walletBalance < upgradeFee) {
            return res.status(400).json({ error: `Insufficient funds. Need ₦${upgradeFee.toLocaleString()}` });
        }

        await prisma.$transaction(async (tx) => {
            // Deduct fee
            if (upgradeFee > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        walletBalance: { decrement: upgradeFee },
                        tierId: tier.id
                    }
                });

                // Record transaction
                await tx.transaction.create({
                    data: {
                        userId,
                        amount: upgradeFee,
                        type: 'UPGRADE',
                        ledgerType: 'VIRTUAL',
                        direction: 'OUT',
                        status: 'SUCCESS',
                        description: `Upgrade to ${tier.name}`,
                        reference: `UPG-${userId}-${Date.now()}`
                    }
                });
            } else {
                await tx.user.update({
                    where: { id: userId },
                    data: { tierId: tier.id }
                });
            }
        });

        res.json({ message: 'Upgrade successful', tier });
    } catch (error) {
        console.error('Upgrade Error:', error);
        res.status(500).json({ error: 'Failed to process upgrade' });
    }
});

export default router;
