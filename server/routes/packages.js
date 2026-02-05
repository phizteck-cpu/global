import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /packages - List all available packages
router.get('/', async (req, res) => {
    try {
        const packages = await prisma.package.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
        res.json(packages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch packages' });
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

// POST /packages - Create package (admin)
router.post('/', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { name, description, price, bvValue, durationWeeks, maxQuantity, imageUrl } = req.body;
        
        const pkg = await prisma.package.create({
            data: {
                name,
                description: description || null,
                price: parseFloat(price),
                bvValue: parseFloat(bvValue) || 0,
                durationWeeks: parseInt(durationWeeks) || 0,
                maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
                imageUrl: imageUrl || null,
                isActive: true
            }
        });
        
        res.status(201).json(pkg);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create package' });
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

export default router;
