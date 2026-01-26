import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Register
// Register
router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, phone, password, tierId, referralCode } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { phone }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone already exists' });
        }

        // Validate Referral Code (Optional)
        let referrer = null;
        if (referralCode) {
            referrer = await prisma.user.findUnique({ where: { referralCode } });
        }

        // Validate Package if provided
        let selectedPackage = null;
        if (tierId) {
            selectedPackage = await prisma.package.findUnique({ where: { id: parseInt(tierId) } });
            if (!selectedPackage) return res.status(400).json({ message: 'Invalid Package selected' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Execute in transaction
        const user = await prisma.$transaction(async (tx) => {
            // Create user with Wallet
            const newUser = await tx.user.create({
                data: {
                    fullName,
                    email,
                    phone,
                    password: hashedPassword,
                    status: "ACTIVE",
                    referredBy: referrer ? referrer.id : null,
                    wallet: {
                        create: {
                            balance: 0.0,
                            lockedBalance: 0.0
                        }
                    }
                }
            });

            // If Package selected, create Subscription (UserPackage)
            if (selectedPackage) {
                await tx.userPackage.create({
                    data: {
                        userId: newUser.id,
                        packageId: selectedPackage.id,
                        startDate: new Date(),
                        status: 'ACTIVE'
                    }
                });
            }

            // Create Referral Record
            if (referrer) {
                await tx.referral.create({
                    data: {
                        referrerId: referrer.id,
                        refereeId: newUser.id,
                        status: 'PENDING',
                        level: 1
                    }
                });
            }

            // Log Registration Fee
            await tx.transaction.create({
                data: {
                    walletId: (await tx.wallet.findUnique({ where: { userId: newUser.id } })).id,
                    type: 'ADMIN_FEE',
                    amount: 3000.00,
                    status: 'SUCCESS',
                    description: 'Registration Fee',
                    reference: `REG-${newUser.id}-${Date.now()}`
                }
            });

            return newUser;
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

        res.status(201).json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, referralCode: user.referralCode } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

        res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
