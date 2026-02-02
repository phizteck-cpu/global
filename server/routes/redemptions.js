import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';
import { authenticateToken, isOps } from '../middleware/auth.js';

const router = express.Router();

// GET /inventory - View Available Food Items
router.get('/inventory', authenticateToken, async (req, res) => {
    try {
        const items = await prisma.inventory.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

// Admin: Add Inventory Item
router.post('/inventory', authenticateToken, isOps, async (req, res) => {

    try {
        const { name, quantity, unit, priceEstimate } = req.body;
        const newItem = await prisma.inventory.create({
            data: {
                name,
                quantity: parseInt(quantity),
                unit,
                priceEstimate: parseFloat(priceEstimate)
            }
        });
        res.status(201).json(newItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add inventory' });
    }
});

// POST /redemptions - Request Store Item / Benefit
router.post('/redemptions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { inventoryId, deliveryAddress, pin } = req.body;

        // 1. Get Store Item
        const item = await prisma.inventory.findUnique({ where: { id: parseInt(inventoryId) } });
        if (!item || item.quantity < 1) {
            return res.status(400).json({ error: 'Item out of stock or invalid' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { tier: true }
        });

        if (!user.transactionPin) {
            return res.status(400).json({ error: 'Transaction PIN not set. Please set it in profile settings.' });
        }

        const isPinMatch = await bcrypt.compare(pin, user.transactionPin);
        if (!isPinMatch) {
            return res.status(400).json({ error: 'Incorrect Transaction PIN' });
        }

        if (!user.tier) {
            return res.status(400).json({ error: 'Active membership tier required.' });
        }

        // 3. Create Request
        await prisma.$transaction(async (tx) => {
            // Log Request
            await tx.redemption.create({
                data: {
                    userId,
                    packageId: user.tierId,
                    status: 'REQUESTED',
                    deliveryAddress: `${deliveryAddress} [ITEM: ${item.name} | Qty: 1]`
                }
            });

            // Reserve item
            await tx.inventory.update({
                where: { id: item.id },
                data: { quantity: { decrement: 1 } }
            });
        });

        res.status(201).json({ message: 'Request submitted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Request failed' });
    }
});

// GET /redemptions - My Redemptions
router.get('/redemptions', authenticateToken, async (req, res) => {
    try {
        const history = await prisma.redemption.findMany({
            where: { userId: req.user.userId },
            orderBy: { requestDate: 'desc' },
            include: { package: true }
        });
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;
