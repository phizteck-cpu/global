import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isSuperAdmin, isOps } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// GET /packages - List Available Packages
router.get('/', async (req, res) => {
    try {
        const packages = await prisma.package.findMany({
            where: { isActive: true },
            orderBy: { weeklyAmount: 'asc' }
        });
        res.json(packages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch packages' });
    }
});

// POST /packages/subscribe - Subscribe to Package
router.post('/subscribe', authenticateToken, async (req, res) => {
    try {
        const { packageId } = req.body;
        const userId = req.user.userId;

        // 1. Check if user already has an active package
        const existingSub = await prisma.userPackage.findFirst({
            where: { userId, status: 'ACTIVE' }
        });

        if (existingSub) {
            return res.status(400).json({ error: 'You already have an active subscription.' });
        }

        // 2. Validate Package
        const pkg = await prisma.package.findUnique({ where: { id: parseInt(packageId) } });
        if (!pkg) return res.status(404).json({ error: 'Package not found' });

        // 3. Create Subscription and Generate 45-Week Schedule
        const userPackage = await prisma.$transaction(async (tx) => {
            const newSub = await tx.userPackage.create({
                data: {
                    userId,
                    packageId: pkg.id,
                    status: 'ACTIVE',
                    startDate: new Date()
                }
            });

            // Generate Schedule
            const contributionsData = [];
            const duration = pkg.durationWeeks || 45;
            const startDate = new Date();

            for (let i = 1; i <= duration; i++) {
                const dueDate = new Date(startDate.getTime());
                dueDate.setDate(dueDate.getDate() + (i * 7)); // Every 7 days

                contributionsData.push({
                    userPackageId: newSub.id,
                    weekNumber: i,
                    amount: pkg.weeklyAmount,
                    status: 'PENDING',
                    dueDate: dueDate
                });
            }

            await tx.contribution.createMany({
                data: contributionsData
            });

            return newSub;
        });

        res.status(201).json({ message: 'Subscribed successfully! Your 45-week schedule has been generated.', subscription: userPackage });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Subscription failed' });
    }
});

// Admin Control: Add Package
router.post('/', authenticateToken, isOps, async (req, res) => {
    try {
        const { name, weeklyAmount, durationWeeks, foodValue, upgradeFee, maintenanceFee } = req.body;
        const newPkg = await prisma.package.create({
            data: {
                name,
                weeklyAmount: parseFloat(weeklyAmount),
                durationWeeks: parseInt(durationWeeks || 45),
                totalAmount: parseFloat(weeklyAmount) * parseInt(durationWeeks || 45),
                foodValue: parseFloat(foodValue || 0),
                upgradeFee: parseFloat(upgradeFee || 0),
                maintenanceFee: parseFloat(maintenanceFee || 0)
            }
        });
        res.status(201).json(newPkg);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create package' });
    }
});

export default router;
