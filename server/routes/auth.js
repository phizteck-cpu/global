import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, username, phone, password, tierId, referralCode } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                    { phone: phone || undefined }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email, username or phone already exists' });
        }

        // Validate Referral Code (Optional)
        let referrer = null;
        if (referralCode) {
            referrer = await prisma.user.findUnique({ where: { referralCode } });
        }

        // Validate Tier
        let selectedTier = null;
        if (tierId) {
            selectedTier = await prisma.tier.findUnique({ where: { id: parseInt(tierId) } });
            if (!selectedTier) return res.status(400).json({ message: 'Invalid Membership Tier selected' });
        } else {
            // Default to STARTER if not provided
            selectedTier = await prisma.tier.findUnique({ where: { name: 'STARTER' } });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Execute in transaction
        const user = await prisma.$transaction(async (tx) => {
            // Create user
            const newUser = await tx.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    username,
                    phone,
                    password: hashedPassword,
                    status: "ACTIVE",
                    referredBy: referrer ? referrer.id : null,
                    tierId: selectedTier.id,
                }
            });

            // 4.1 Administrative Fee System (Onboarding)
            // Register specific tier onboarding fee
            await tx.transaction.create({
                data: {
                    userId: newUser.id,
                    amount: selectedTier.onboardingFee,
                    type: 'ONBOARDING_FEE',
                    ledgerType: 'COMPANY',
                    direction: 'IN',
                    status: 'SUCCESS',
                    description: `Onboarding Fee for ${selectedTier.name} tier`,
                    reference: `REG-${newUser.id}-${Date.now()}`
                }
            });

            return newUser;
        });

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                referralCode: user.referralCode
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { username },
            include: { tier: true }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                tier: user.tier?.name
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
