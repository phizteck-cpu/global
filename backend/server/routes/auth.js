import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../prisma/client.js';

import { validateSignup } from '../middleware/validate.js';

const router = express.Router();

// Helper functions for tokens
const generateAccessToken = (user) => {
    return jwt.sign(
        { userId: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET || 'secret_key',
        { expiresIn: '15m' } // Short-lived access token
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
        { expiresIn: '7d' } // Longer-lived refresh token
    );
};

const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Helper to send email (placeholder - implement with your email service)
const sendEmail = async (to, subject, text) => {
    // In production, use nodemailer or similar
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}, Body: ${text}`);
    // TODO: Implement actual email sending
};

// Signup
router.post('/signup', validateSignup, async (req, res) => {
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

        // Generate verification token
        const verificationToken = generateVerificationToken();

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
                    verificationToken,
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

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token to user
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        // Send verification email
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-email/${verificationToken}`;
        await sendEmail(
            email,
            'Email Verification',
            `Please click the following link to verify your email: ${verifyUrl}`
        );

        res.status(201).json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                referralCode: user.referralCode,
                emailVerified: user.emailVerified
            },
            message: 'Signup successful. Please check your email to verify your account.'
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
        const identifier = (username || '').trim();

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: identifier },
                    { email: identifier },
                    { phone: identifier }
                ]
            },
            include: { tier: true }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if account is suspended
        if (user.status === 'SUSPENDED') {
            return res.status(403).json({ message: 'Account is suspended. Please contact support.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token to user
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                tier: user.tier?.name,
                emailVerified: user.emailVerified,
                twoFactorEnabled: user.twoFactorEnabled
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Refresh Token
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key');

        if (decoded.type !== 'refresh') {
            return res.status(401).json({ message: 'Invalid token type' });
        }

        // Find user with this refresh token
        const user = await prisma.user.findFirst({
            where: {
                id: decoded.userId,
                refreshToken: refreshToken
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Update refresh token in database
        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken }
        });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Clear refresh token from database
        if (refreshToken) {
            await prisma.user.updateMany({
                where: { refreshToken },
                data: { refreshToken: null }
            });
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Don't reveal if user exists
            return res.json({ message: 'If an account exists with this email, a password reset link will be sent.' });
        }

        // Generate reset token
        const resetToken = generateResetToken();
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetExpires
            }
        });

        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        await sendEmail(
            email,
            'Password Reset Request',
            `Please click the following link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.`
        );

        res.json({ message: 'If an account exists with this email, a password reset link will be sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Find user with valid reset token
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gt: new Date() // Token must not be expired
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                refreshToken: null // Invalidate all existing sessions
            }
        });

        // Send confirmation email
        await sendEmail(
            user.email,
            'Password Changed',
            'Your password has been successfully changed. If you did not make this change, please contact support immediately.'
        );

        res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify Email (resend)
router.post('/verify-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.emailVerified) {
            return res.json({ message: 'Email is already verified' });
        }

        // Generate new verification token
        const verificationToken = generateVerificationToken();

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationToken }
        });

        // Send verification email
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-email/${verificationToken}`;
        await sendEmail(
            email,
            'Email Verification',
            `Please click the following link to verify your email: ${verifyUrl}`
        );

        res.json({ message: 'Verification email has been sent. Please check your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Confirm Email
router.get('/confirm-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await prisma.user.findFirst({
            where: {
                verificationToken: token,
                emailVerified: false
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationToken: null
            }
        });

        // Redirect to frontend with success message
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?verified=true`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Enable 2FA (Setup)
router.post('/enable-2fa', async (req, res) => {
    try {
        const { userId } = req.body;

        // TODO: Implement TOTP-based 2FA using speakeasy or similar
        // For now, return placeholder response
        
        res.json({ 
            message: '2FA setup initiated',
            secret: 'PLACEHOLDER_SECRET', // In production, generate actual TOTP secret
            qrCode: 'PLACEHOLDER_QR_CODE' // In production, generate actual QR code
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify 2FA
router.post('/verify-2fa', async (req, res) => {
    try {
        const { userId, code } = req.body;

        // TODO: Implement TOTP verification using speakeasy or similar
        
        // Placeholder response
        res.json({ verified: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
