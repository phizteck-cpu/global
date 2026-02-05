import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client.js';
import { authenticateToken, isSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /redemptions - List user's redemptions
router.get('/', authenticateToken, async (req, res) => {
    try {
        const redemptions = await prisma.redemption.findMany({
            where: { userId: req.user.userId },
            include: { 
                package: { select: { id: true, name: true, price: true, bvValue: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(redemptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch redemptions' });
    }
});

// POST /redemptions - Create redemption request
router.post('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { packageId, pointsToUse, pin } = req.body;

        // Get the package
        const pkg = await prisma.package.findUnique({
            where: { id: parseInt(packageId) }
        });

        if (!pkg) {
            return res.status(404).json({ error: 'Package not found' });
        }

        if (!pkg.isActive) {
            return res.status(400).json({ error: 'Package is not available' });
        }

        // Check quantity if limited
        if (pkg.maxQuantity !== null) {
            const existingRedemptions = await prisma.redemption.count({
                where: { packageId: pkg.id, status: { notIn: ['REJECTED', 'CANCELLED'] } }
            });
            if (existingRedemptions >= pkg.maxQuantity) {
                return res.status(400).json({ error: 'Package is sold out' });
            }
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify transaction PIN if provided
        if (user.transactionPin) {
            if (!pin) {
                return res.status(400).json({ error: 'Transaction PIN required' });
            }
            const isPinMatch = await bcrypt.compare(pin, user.transactionPin);
            if (!isPinMatch) {
                return res.status(400).json({ error: 'Incorrect Transaction PIN' });
            }
        }

        // Calculate amount to pay (price minus points if applicable)
        const pointsUsed = parseFloat(pointsToUse) || 0;
        let finalAmount = pkg.price;
        let pointsDeducted = 0;

        if (pointsUsed > 0) {
            // Use BV points if available
            if (user.bvBalance >= pointsUsed) {
                pointsDeducted = pointsUsed;
                finalAmount = Math.max(0, pkg.price - pointsUsed);
            } else {
                return res.status(400).json({ error: 'Insufficient BV balance' });
            }
        }

        // Check wallet balance for remaining amount
        if (finalAmount > 0 && user.walletBalance < finalAmount) {
            return res.status(400).json({ error: `Insufficient wallet balance. Required: ₦${finalAmount.toFixed(2)}` });
        }

        // Create redemption
        const redemption = await prisma.$transaction(async (tx) => {
            // Create redemption record
            const redemption = await tx.redemption.create({
                data: {
                    userId,
                    packageId: pkg.id,
                    amount: finalAmount,
                    pointsUsed: pointsDeducted,
                    status: 'PENDING'
                }
            });

            // Deduct from wallet if needed
            if (finalAmount > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: { walletBalance: { decrement: finalAmount } }
                });

                // Create transaction record
                await tx.transaction.create({
                    data: {
                        userId,
                        amount: finalAmount,
                        type: 'REDEMPTION',
                        ledgerType: 'VIRTUAL',
                        direction: 'OUT',
                        status: 'SUCCESS',
                        description: `Redemption: ${pkg.name}`,
                        reference: `RED-${userId}-${Date.now()}`
                    }
                });
            }

            // Deduct BV points if used
            if (pointsDeducted > 0) {
                await tx.user.update({
                    where: { id: userId },
                    data: { bvBalance: { decrement: pointsDeducted } }
                });
            }

            return redemption;
        });

        res.status(201).json({ 
            message: 'Redemption request submitted successfully',
            redemption: {
                id: redemption.id,
                package: pkg.name,
                amount: redemption.amount,
                pointsUsed: redemption.pointsUsed,
                status: redemption.status
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create redemption' });
    }
});

// PUT /redemptions/:id/status - Update redemption status (admin)
router.put('/:id/status', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const redemption = await prisma.redemption.findUnique({
            where: { id: parseInt(id) }
        });

        if (!redemption) {
            return res.status(404).json({ error: 'Redemption not found' });
        }

        const updatedRedemption = await prisma.redemption.update({
            where: { id: parseInt(id) },
            data: {
                status,
                adminNote: adminNote || null,
                processedAt: status !== 'PENDING' ? new Date() : null
            }
        });

        // If rejected, refund the wallet and BV
        if (status === 'REJECTED' && redemption.amount > 0) {
            await prisma.user.update({
                where: { id: redemption.userId },
                data: {
                    walletBalance: { increment: redemption.amount },
                    bvBalance: { increment: redemption.pointsUsed }
                }
            });
        }

        res.json({ 
            message: 'Redemption status updated',
            redemption: updatedRedemption
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update redemption status' });
    }
});

// GET /redemptions/all - List all redemptions (admin)
router.get('/all', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) {
            where.status = status;
        }

        const [redemptions, total] = await Promise.all([
            prisma.redemption.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                    package: { select: { id: true, name: true, price: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.redemption.count({ where })
        ]);

        res.json({
            redemptions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch redemptions' });
    }
});

export default router;
