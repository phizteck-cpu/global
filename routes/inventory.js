import express from 'express';
import prisma from '../prisma/client.js';
import { authenticateToken, anyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /inventory - List all commodities
router.get('/', authenticateToken, anyAdmin, async (req, res) => {
    try {
        // Since there is no Inventory model in schema.prisma, we use Package as commodities
        const packages = await prisma.package.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });

        // Map Package fields to what AdminInventory.jsx expects
        const inventory = packages.map(pkg => {
            const unitMatch = pkg.description?.match(/Unit:\s*(.*)/);
            return {
                id: pkg.id,
                name: pkg.name,
                quantity: pkg.maxQuantity || 0,
                unit: unitMatch ? unitMatch[1] : 'units',
                priceEstimate: pkg.price
            };
        });

        res.json(inventory);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// POST /inventory - Add to inventory
router.post('/', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { name, quantity, unit, priceEstimate } = req.body;
        const pkg = await prisma.package.create({
            data: {
                name,
                price: parseFloat(priceEstimate) || 0,
                maxQuantity: parseInt(quantity) || 0,
                description: `Unit: ${unit}`,
                isActive: true
            }
        });
        res.status(201).json(pkg);
    } catch (error) {
        console.error('Error adding to inventory:', error);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// PUT /inventory/:id - Update inventory item
router.put('/:id', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity, unit, priceEstimate } = req.body;
        const pkg = await prisma.package.update({
            where: { id: parseInt(id) },
            data: {
                name,
                price: parseFloat(priceEstimate) || 0,
                maxQuantity: parseInt(quantity) || 0,
                description: `Unit: ${unit}`
            }
        });
        res.json(pkg);
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// DELETE /inventory/:id - Remove item
router.delete('/:id', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.package.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Item removed from inventory' });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

export default router;
