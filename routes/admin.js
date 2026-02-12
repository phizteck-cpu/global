import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';
import { authenticateToken, isSuperAdmin, isAdmin, isFinance, isOps, anyAdmin } from '../middleware/auth.js';
import { enforceContributionPolicy, getEnforcementStats, checkUserEnforcement } from '../services/contributionEnforcement.js';

const router = express.Router();

// ============================================
// Admin Login (uses same auth as members)
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await prisma.user.findFirst({
            where: {
                username: username.trim(),
                role: { in: ['ADMIN', 'SUPERADMIN', 'FINANCE_ADMIN', 'OPS_ADMIN', 'SUPPORT_ADMIN', 'ACCOUNTANT'] }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role, email: user.email },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id, type: 'refresh' },
            process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
            { expiresIn: '7d' }
        );

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
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Stats
router.get('/stats', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const totalUsers = await prisma.user.count({ where: { role: 'MEMBER' } });

        // Sum total cooperative assets (Cooperative Ledger)
        const totalAssets = await prisma.user.aggregate({
            _sum: { contributionBalance: true }
        });

        // Pending Withdrawals
        const pendingApprovals = await prisma.withdrawal.count({
            where: { status: 'PENDING' }
        });

        // Company Revenue (Transactions in COMPANY ledger)
        const companyRevenue = await prisma.transaction.aggregate({
            where: { ledgerType: 'COMPANY', status: 'SUCCESS' },
            _sum: { amount: true }
        });

        res.json({
            totalUsers,
            totalAssets: totalAssets._sum.contributionBalance || 0,
            pendingApprovals,
            companyRevenue: companyRevenue._sum.amount || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Recent Users
router.get('/users', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                tier: true,
                _count: {
                    select: { contributions: { where: { status: 'PAID' } } }
                }
            }
        });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Audit Logs
router.get('/audit-logs', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50,
            include: {
                admin: { select: { email: true, username: true, firstName: true, lastName: true } },
                targetUser: { select: { email: true, username: true, firstName: true, lastName: true } }
            }
        });
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// Admin Control: Get Full Member Profile
router.get('/users/:id', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            include: {
                tier: true,
                contributions: { orderBy: { weekNumber: 'asc' } },
                transactions: { orderBy: { createdAt: 'desc' }, take: 20 }
            }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { password, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

// Admin Control: Patch User Status/KYC
router.patch('/users/:id/status', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, kycVerified } = req.body;
        const adminId = req.user.userId;

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent admins from modifying other admins
        if (user.role !== 'MEMBER') {
            return res.status(403).json({ error: 'Cannot modify admin accounts' });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (kycVerified !== undefined) updateData.kycStatus = kycVerified ? 'VERIFIED' : 'REJECTED';

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: parseInt(id) },
                data: updateData
            });

            // Create audit log
            await tx.auditLog.create({
                data: {
                    adminId,
                    action: 'USER_STATUS_UPDATE',
                    targetUserId: parseInt(id),
                    details: `Updated user status to ${status || 'unchanged'}, KYC: ${kycVerified !== undefined ? (kycVerified ? 'VERIFIED' : 'REJECTED') : 'unchanged'}`
                }
            });

            // Notify user if suspended or banned
            if (status === 'SUSPENDED' || status === 'BANNED') {
                await tx.notification.create({
                    data: {
                        userId: parseInt(id),
                        type: 'SYSTEM',
                        title: `Account ${status === 'SUSPENDED' ? 'Suspended' : 'Banned'} ⚠️`,
                        message: `Your account has been ${status.toLowerCase()} by admin. Please contact support for more information.`
                    }
                });
            }
        });

        res.json({ message: 'User status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

// Admin Control: Ban User Account
router.post('/users/:id/ban', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.userId;

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ error: 'Ban reason is required' });
        }

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role !== 'MEMBER') {
            return res.status(403).json({ error: 'Cannot ban admin accounts' });
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: parseInt(id) },
                data: { status: 'BANNED' }
            });

            // Create audit log
            await tx.auditLog.create({
                data: {
                    adminId,
                    action: 'USER_BANNED',
                    targetUserId: parseInt(id),
                    details: `Banned user account. Reason: ${reason}`
                }
            });

            // Notify user
            await tx.notification.create({
                data: {
                    userId: parseInt(id),
                    type: 'SYSTEM',
                    title: 'Account Banned 🚫',
                    message: `Your account has been permanently banned. Reason: ${reason}`
                }
            });
        });

        res.json({ message: 'User account banned successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to ban user' });
    }
});

// Super Admin Control: Delete User Account (PERMANENT)
router.delete('/users/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { confirmation } = req.body;
        const adminId = req.user.userId;

        if (confirmation !== 'DELETE') {
            return res.status(400).json({ error: 'Confirmation required. Send { "confirmation": "DELETE" }' });
        }

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.role !== 'MEMBER') {
            return res.status(403).json({ error: 'Cannot delete admin accounts' });
        }

        // Store user info for audit log before deletion
        const userInfo = `${user.username} (${user.email})`;

        await prisma.$transaction(async (tx) => {
            // Delete related records first (due to foreign key constraints)
            await tx.notification.deleteMany({ where: { userId: parseInt(id) } });
            await tx.contribution.deleteMany({ where: { userId: parseInt(id) } });
            await tx.transaction.deleteMany({ where: { userId: parseInt(id) } });
            await tx.withdrawal.deleteMany({ where: { userId: parseInt(id) } });
            await tx.bonus.deleteMany({ where: { userId: parseInt(id) } });
            await tx.redemption.deleteMany({ where: { userId: parseInt(id) } });
            await tx.paymentProof.deleteMany({ where: { userId: parseInt(id) } });
            
            // Delete referrals
            await tx.referral.deleteMany({ 
                where: { 
                    OR: [
                        { referrerId: parseInt(id) },
                        { referredId: parseInt(id) }
                    ]
                } 
            });

            // Delete audit logs where user is target
            await tx.auditLog.deleteMany({ where: { targetUserId: parseInt(id) } });

            // Finally delete the user
            await tx.user.delete({ where: { id: parseInt(id) } });

            // Create audit log for deletion
            await tx.auditLog.create({
                data: {
                    adminId,
                    action: 'USER_DELETED',
                    details: `Permanently deleted user account: ${userInfo}`
                }
            });
        });

        res.json({ message: 'User account permanently deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete user account' });
    }
});

// Super Admin Control: Update Role
router.patch('/users/:id/role', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'UPDATE_USER_ROLE',
                details: `Changed user ${id} role to ${role}`,
                targetUserId: parseInt(id)
            }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// Super Admin Control: Adjust User Balance
router.patch('/users/:id/balance', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { walletBalance, contributionBalance, bvBalance, reason } = req.body;

        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                ...(walletBalance !== undefined && { walletBalance: parseFloat(walletBalance) }),
                ...(contributionBalance !== undefined && { contributionBalance: parseFloat(contributionBalance) }),
                ...(bvBalance !== undefined && { bvBalance: parseFloat(bvBalance) }),
            }
        });

        // Create transaction logs for the adjustments
        if (walletBalance !== undefined) {
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    amount: Math.abs(parseFloat(walletBalance) - user.walletBalance),
                    ledgerType: 'VIRTUAL',
                    type: 'ADJUSTMENT',
                    direction: parseFloat(walletBalance) > user.walletBalance ? 'IN' : 'OUT',
                    status: 'SUCCESS',
                    description: `Admin balance adjustment: ${reason || 'System update'}`
                }
            });
        }

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'BALANCE_ADJUSTMENT',
                details: `Adjusted user ${id} balances. Wallet: ${walletBalance}, Contribution: ${contributionBalance}, BV: ${bvBalance}. Reason: ${reason}`,
                targetUserId: parseInt(id)
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to adjust balance' });
    }
});

// Super Admin Control: Manually Update User Tier
router.patch('/users/:id/tier', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { tierId } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { tierId: parseInt(tierId) }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'MANUAL_TIER_UPDATE',
                details: `Manually changed user ${id} tier to ID: ${tierId}`,
                targetUserId: parseInt(id)
            }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update tier' });
    }
});



// Super Admin Control: Impersonate Member
router.post('/impersonate/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = jwt.sign(
            { userId: user.id, role: user.role, isImpersonated: true, adminId: req.user.id },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1007d' }
        );

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'IMPERSONATE_USER',
                details: `Started impersonation of user ${user.email}`,
                targetUserId: user.id
            }
        });

        res.json({ token, user: { id: user.id, email: user.email, username: user.username, firstName: user.firstName, lastName: user.lastName, role: user.role, isImpersonating: true } });
    } catch (error) {
        res.status(500).json({ error: 'Impersonation failed' });
    }
});

// Super Admin Control: Reset User Password
router.patch('/users/:id/password', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: parseInt(id) },
            data: { password: hashedPassword }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'MANUAL_PASSWORD_RESET',
                details: `Manually reset password for user ${id}`,
                targetUserId: parseInt(id)
            }
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

import { validateAdminCreate } from '../middleware/validate.js';

// Super Admin Control: Register Staff
router.post('/register', authenticateToken, isSuperAdmin, validateAdminCreate, async (req, res) => {
    try {
        const { firstName, lastName, fullName, email, username, password, role } = req.body;

        // Use fullName to split if firstName/lastName not provided (compat with frontend)
        let fName = firstName;
        let lName = lastName;
        if (!fName && fullName) {
            [fName, ...lName] = fullName.split(' ');
            lName = lName.join(' ');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = await prisma.user.create({
            data: {
                firstName: fName || 'Staff',
                lastName: lName || 'Member',
                email,
                username,
                password: hashedPassword,
                role: role || 'ADMIN',
                kycStatus: 'VERIFIED'
            }
        });

        res.status(201).json({ message: 'Staff created', user: { id: newStaff.id, username: newStaff.username, email: newStaff.email, role: newStaff.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to register staff: ' + (error.code === 'P2002' ? 'Email or Username already exists' : error.message) });
    }
});

// Super Admin Control: Get All Staff
router.get('/staff', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const staff = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'SUPERADMIN', 'FINANCE_ADMIN', 'OPS_ADMIN', 'SUPPORT_ADMIN', 'ACCOUNTANT'] }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                role: true,
                createdAt: true
            }
        });

        // Add fullName for frontend compatibility
        const staffWithFullName = staff.map(s => ({
            ...s,
            fullName: `${s.firstName} ${s.lastName}`
        }));

        res.json(staffWithFullName);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

// Super Admin Control: Get Company Bank Settings
router.get('/company-settings', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const settings = await prisma.systemConfig.findMany({
            where: {
                key: { in: ['company_bank_name', 'company_account_number', 'company_account_name'] }
            }
        });

        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });

        res.json({
            bankName: settingsMap.company_bank_name || '',
            accountNumber: settingsMap.company_account_number || '',
            accountName: settingsMap.company_account_name || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch company settings' });
    }
});

// Super Admin Control: Update Company Bank Settings
router.put('/company-settings', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { bankName, accountNumber, accountName } = req.body;

        // Upsert each setting
        const updates = [
            { key: 'company_bank_name', value: bankName || '' },
            { key: 'company_account_number', value: accountNumber || '' },
            { key: 'company_account_name', value: accountName || '' }
        ];

        for (const update of updates) {
            await prisma.systemConfig.upsert({
                where: { key: update.key },
                update: { value: update.value },
                create: { key: update.key, value: update.value }
            });
        }

        // Audit log
        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'UPDATE_COMPANY_BANK_SETTINGS',
                details: `Updated company bank: ${bankName}, Account: ${accountNumber}, Name: ${accountName}`
            }
        });

        res.json({ message: 'Company bank settings updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update company settings' });
    }
});

// ============================================
// Admin Approvals (User Approvals)
// ============================================
router.get('/approvals', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const pendingUsers = await prisma.user.findMany({
            where: {
                status: 'PENDING_KYC'
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(pendingUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
});

router.post('/approvals/:id/approve', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                status: 'ACTIVE',
                kycStatus: 'VERIFIED'
            }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'USER_APPROVAL',
                details: `Approved user ${id}`,
                targetUserId: parseInt(id)
            }
        });

        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to approve user' });
    }
});

router.post('/approvals/:id/reject', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                status: 'SUSPENDED',
                kycStatus: 'REJECTED'
            }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'USER_REJECTION',
                details: `Rejected user ${id}: ${reason || 'No reason provided'}`,
                targetUserId: parseInt(id)
            }
        });

        res.json({ message: 'User rejected', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reject user' });
    }
});

// ============================================
// Admin Withdrawals
// ============================================
router.get('/withdrawals', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const withdrawals = await prisma.withdrawal.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        res.json(withdrawals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }
});

router.post('/withdrawals/:id/:action', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id, action } = req.params;
        const { reason } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id: parseInt(id) }
        });

        if (!withdrawal) {
            return res.status(404).json({ error: 'Withdrawal not found' });
        }

        if (action === 'approve') {
            // Credit the user's wallet balance (from frozen contribution balance)
            await prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: withdrawal.userId },
                    data: {
                        contributionBalance: { decrement: withdrawal.amount }
                    }
                });

                await tx.withdrawal.update({
                    where: { id: parseInt(id) },
                    data: {
                        status: 'APPROVED',
                        adminId: req.user.id,
                        processedAt: new Date()
                    }
                });

                await tx.transaction.create({
                    data: {
                        userId: withdrawal.userId,
                        amount: withdrawal.amount,
                        type: 'WITHDRAWAL',
                        ledgerType: 'COOPERATIVE',
                        direction: 'OUT',
                        status: 'SUCCESS',
                        description: `Approved withdrawal: ${reason || 'Approved by admin'}`,
                        reference: `WD-APP-${id}-${Date.now()}`
                    }
                });
            });

            await prisma.auditLog.create({
                data: {
                    adminId: req.user.id,
                    action: 'WITHDRAWAL_APPROVAL',
                    details: `Approved withdrawal ${id}: ${reason || 'No reason'}`,
                    targetUserId: withdrawal.userId
                }
            });

            res.json({ message: 'Withdrawal approved' });
        } else {
            // Reject - return funds to contribution balance
            await prisma.$transaction(async (tx) => {
                await tx.withdrawal.update({
                    where: { id: parseInt(id) },
                    data: {
                        status: 'REJECTED',
                        adminId: req.user.id,
                        processedAt: new Date()
                    }
                });

                await tx.transaction.create({
                    data: {
                        userId: withdrawal.userId,
                        amount: withdrawal.amount,
                        type: 'WITHDRAWAL_REJECT',
                        ledgerType: 'COOPERATIVE',
                        direction: 'IN',
                        status: 'SUCCESS',
                        description: `Withdrawal rejected: ${reason || 'Rejected by admin'}`,
                        reference: `WD-REJ-${id}-${Date.now()}`
                    }
                });
            });

            await prisma.auditLog.create({
                data: {
                    adminId: req.user.id,
                    action: 'WITHDRAWAL_REJECTION',
                    details: `Rejected withdrawal ${id}: ${reason || 'No reason'}`,
                    targetUserId: withdrawal.userId
                }
            });

            res.json({ message: 'Withdrawal rejected' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process withdrawal' });
    }
});

// ============================================
// Admin Packages
// ============================================
router.get('/packages', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const packages = await prisma.package.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(packages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch packages' });
    }
});

router.post('/packages', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { name, description, price, bvValue, durationWeeks, maxQuantity, isActive, imageUrl } = req.body;
        const newPackage = await prisma.package.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                bvValue: parseFloat(bvValue) || 0,
                durationWeeks: parseInt(durationWeeks) || 0,
                maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
                isActive: isActive !== false,
                imageUrl
            }
        });
        res.json({ message: 'Package created', package: newPackage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create package' });
    }
});

router.put('/packages/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, bvValue, durationWeeks, maxQuantity, isActive, imageUrl } = req.body;
        const updatedPackage = await prisma.package.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                price: parseFloat(price),
                bvValue: parseFloat(bvValue) || 0,
                durationWeeks: parseInt(durationWeeks) || 0,
                maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
                isActive: isActive !== false,
                imageUrl
            }
        });
        res.json({ message: 'Package updated', package: updatedPackage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update package' });
    }
});

router.delete('/packages/:id', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if this is a tier or package by trying tier first
        const tier = await prisma.tier.findUnique({ where: { id: parseInt(id) } });
        
        if (tier) {
            // Check if any users are using this tier
            const usersWithTier = await prisma.user.count({ where: { tierId: parseInt(id) } });
            
            if (usersWithTier > 0) {
                return res.status(400).json({ 
                    error: 'Cannot delete tier',
                    message: `${usersWithTier} member(s) are currently enrolled in this tier. Please migrate them first.`
                });
            }
            
            await prisma.tier.delete({ where: { id: parseInt(id) } });
            return res.json({ message: 'Tier deleted successfully' });
        }
        
        // If not a tier, try package
        await prisma.package.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Tier or package not found' });
        }
        res.status(500).json({ error: 'Failed to delete' });
    }
});

// ============================================
// Admin Redemptions (Benefit Fulfillment)
// ============================================
router.get('/redemptions', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const redemptions = await prisma.redemption.findMany({
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                package: { select: { id: true, name: true, price: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to what AdminInventory.jsx expects
        const mapped = redemptions.map(r => ({
            id: r.id,
            user: { fullName: `${r.user.firstName} ${r.user.lastName}` },
            requestDate: r.createdAt,
            status: r.status === 'PENDING' ? 'REQUESTED' : (r.status === 'COMPLETED' ? 'DELIVERED' : r.status),
            deliveryAddress: r.adminNote || 'Contact member for logistics'
        }));

        res.json(mapped);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch redemptions' });
    }
});

router.post('/redemptions/:id/status', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Map status back if needed
        let dbStatus = status;
        if (status === 'DELIVERED') dbStatus = 'COMPLETED';
        if (status === 'REQUESTED') dbStatus = 'PENDING';

        const updated = await prisma.redemption.update({
            where: { id: parseInt(id) },
            data: {
                status: dbStatus,
                processedAt: new Date()
            }
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update redemption status' });
    }
});

// ============================================
// ADMIN FUNDING MANAGEMENT
// ============================================

// POST /api/admin/fund-user - Manually fund a user's wallet
router.post('/fund-user', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;
        const adminId = req.user.userId;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid user ID and amount are required' });
        }

        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await prisma.$transaction(async (tx) => {
            // Credit user wallet
            await tx.user.update({
                where: { id: parseInt(userId) },
                data: { walletBalance: { increment: parseFloat(amount) } }
            });

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId: parseInt(userId),
                    type: 'FUNDING',
                    ledgerType: 'VIRTUAL',
                    direction: 'IN',
                    amount: parseFloat(amount),
                    status: 'SUCCESS',
                    reference: `ADMIN-FUND-${Date.now()}`,
                    description: reason || 'Manual funding by admin'
                }
            });

            // Create notification for user
            await tx.notification.create({
                data: {
                    userId: parseInt(userId),
                    type: 'SYSTEM',
                    title: 'Wallet Funded 💰',
                    message: `Your wallet has been credited with ₦${parseFloat(amount).toLocaleString()} by admin. ${reason ? `Reason: ${reason}` : ''}`
                }
            });

            // Create audit log
            await tx.auditLog.create({
                data: {
                    adminId,
                    action: 'MANUAL_WALLET_FUNDING',
                    targetUserId: parseInt(userId),
                    details: `Funded user wallet with ₦${amount}. Reason: ${reason || 'Not specified'}`
                }
            });
        });

        res.json({ message: 'User wallet funded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fund user wallet' });
    }
});

// POST /api/admin/deduct-user - Manually deduct from a user's wallet (SUPERADMIN only)
router.post('/deduct-user', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        const { userId, amount, reason } = req.body;
        const adminId = req.user.userId;

        if (!userId || !amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid user ID and amount are required' });
        }

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({ error: 'Reason is required for wallet deductions' });
        }

        const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.walletBalance < parseFloat(amount)) {
            return res.status(400).json({ error: 'Insufficient wallet balance for deduction' });
        }

        await prisma.$transaction(async (tx) => {
            // Deduct from user wallet
            await tx.user.update({
                where: { id: parseInt(userId) },
                data: { walletBalance: { decrement: parseFloat(amount) } }
            });

            // Create transaction record
            await tx.transaction.create({
                data: {
                    userId: parseInt(userId),
                    type: 'DEDUCTION',
                    ledgerType: 'VIRTUAL',
                    direction: 'OUT',
                    amount: parseFloat(amount),
                    status: 'SUCCESS',
                    reference: `ADMIN-DEDUCT-${Date.now()}`,
                    description: reason
                }
            });

            // Create notification for user
            await tx.notification.create({
                data: {
                    userId: parseInt(userId),
                    type: 'SYSTEM',
                    title: 'Wallet Deduction ⚠️',
                    message: `₦${parseFloat(amount).toLocaleString()} has been deducted from your wallet by admin. Reason: ${reason}`
                }
            });

            // Create audit log
            await tx.auditLog.create({
                data: {
                    adminId,
                    action: 'MANUAL_WALLET_DEDUCTION',
                    targetUserId: parseInt(userId),
                    details: `Deducted ₦${amount} from user wallet. Reason: ${reason}`
                }
            });
        });

        res.json({ message: 'User wallet deducted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to deduct from user wallet' });
    }
});

// GET /api/admin/company-account - Get company bank account details
router.get('/company-account', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const bankName = await prisma.systemConfig.findUnique({ where: { key: 'COMPANY_BANK_NAME' } });
        const accountNumber = await prisma.systemConfig.findUnique({ where: { key: 'COMPANY_ACCOUNT_NUMBER' } });
        const accountName = await prisma.systemConfig.findUnique({ where: { key: 'COMPANY_ACCOUNT_NAME' } });

        res.json({
            bankName: bankName?.value || '',
            accountNumber: accountNumber?.value || '',
            accountName: accountName?.value || ''
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch company account' });
    }
});

// POST /api/admin/company-account - Update company bank account details
router.post('/company-account', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { bankName, accountNumber, accountName } = req.body;
        const adminId = req.user.userId;

        if (!bankName || !accountNumber || !accountName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        await prisma.$transaction(async (tx) => {
            // Upsert bank name
            await tx.systemConfig.upsert({
                where: { key: 'COMPANY_BANK_NAME' },
                update: { value: bankName },
                create: { key: 'COMPANY_BANK_NAME', value: bankName }
            });

            // Upsert account number
            await tx.systemConfig.upsert({
                where: { key: 'COMPANY_ACCOUNT_NUMBER' },
                update: { value: accountNumber },
                create: { key: 'COMPANY_ACCOUNT_NUMBER', value: accountNumber }
            });

            // Upsert account name
            await tx.systemConfig.upsert({
                where: { key: 'COMPANY_ACCOUNT_NAME' },
                update: { value: accountName },
                create: { key: 'COMPANY_ACCOUNT_NAME', value: accountName }
            });

            // Create audit log
            await tx.auditLog.create({
                data: {
                    adminId,
                    action: 'COMPANY_ACCOUNT_UPDATE',
                    details: `Updated company bank account: ${bankName} - ${accountNumber} - ${accountName}`
                }
            });
        });

        res.json({ message: 'Company account details updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update company account' });
    }
});

// ============================================
// PAYMENT PROOF APPROVAL SYSTEM
// ============================================

// GET /api/admin/payment-proofs - Get all pending payment proofs
router.get('/payment-proofs', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};

        const proofs = await prisma.paymentProof.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(proofs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch payment proofs' });
    }
});

// POST /api/admin/payment-proofs/:id/approve - Approve payment proof
router.post('/payment-proofs/:id/approve', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;
        const adminId = req.user.userId;

        const proof = await prisma.paymentProof.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });

        if (!proof) {
            return res.status(404).json({ error: 'Payment proof not found' });
        }

        if (proof.status !== 'PENDING') {
            return res.status(400).json({ error: 'Payment proof already processed' });
        }

        await prisma.$transaction(async (tx) => {
            // Update payment proof status
            await tx.paymentProof.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'APPROVED',
                    adminId,
                    adminNote: adminNote || 'Approved',
                    processedAt: new Date()
                }
            });

            // Check if this is an activation payment (₦3,000)
            if (proof.amount === 3000 && proof.user.status === 'PENDING_APPROVAL') {
                // Activate user account
                await tx.user.update({
                    where: { id: proof.userId },
                    data: { status: 'ACTIVE' }
                });

                // Record activation fee transaction
                await tx.transaction.create({
                    data: {
                        userId: proof.userId,
                        amount: 3000,
                        type: 'ONBOARDING_FEE',
                        ledgerType: 'COMPANY',
                        direction: 'IN',
                        status: 'SUCCESS',
                        reference: `ACTIVATION-${proof.userId}-${Date.now()}`,
                        description: 'Account Activation Fee'
                    }
                });

                // Create notification for user - account activated
                await tx.notification.create({
                    data: {
                        userId: proof.userId,
                        type: 'SYSTEM',
                        title: 'Account Activated ✅',
                        message: `Your activation payment has been approved! Your account is now active. You can login and start using the platform.`
                    }
                });
            } else {
                // Regular wallet funding
                await tx.user.update({
                    where: { id: proof.userId },
                    data: {
                        walletBalance: { increment: proof.amount }
                    }
                });

                // Create transaction record
                await tx.transaction.create({
                    data: {
                        userId: proof.userId,
                        type: 'FUNDING',
                        ledgerType: 'VIRTUAL',
                        direction: 'IN',
                        amount: proof.amount,
                        status: 'SUCCESS',
                        reference: `PROOF-${id}-${Date.now()}`,
                        description: `Wallet Funding - Payment Proof #${id} Approved`
                    }
                });

                // Create notification for user
                await tx.notification.create({
                    data: {
                        userId: proof.userId,
                        type: 'SYSTEM',
                        title: 'Payment Approved ✅',
                        message: `Your payment of ₦${proof.amount.toLocaleString()} has been approved. Your wallet has been credited.`
                    }
                });
            }

            // Create audit log
            await tx.auditLog.create({
                data: {
                    adminId,
                    action: proof.amount === 3000 ? 'ACTIVATION_PAYMENT_APPROVED' : 'PAYMENT_PROOF_APPROVED',
                    targetUserId: proof.userId,
                    details: `Approved payment proof #${id} for ₦${proof.amount}. ${adminNote || ''}`
                }
            });
        });

        res.json({ message: proof.amount === 3000 ? 'Activation payment approved and user account activated' : 'Payment proof approved and wallet credited' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to approve payment proof' });
    }
});

// POST /api/admin/payment-proofs/:id/reject - Reject payment proof
router.post('/payment-proofs/:id/reject', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { adminNote } = req.body;
        const adminId = req.user.userId;

        if (!adminNote) {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        const proof = await prisma.paymentProof.findUnique({
            where: { id: parseInt(id) },
            include: { user: true }
        });

        if (!proof) {
            return res.status(404).json({ error: 'Payment proof not found' });
        }

        if (proof.status !== 'PENDING') {
            return res.status(400).json({ error: 'Payment proof already processed' });
        }

        await prisma.$transaction(async (tx) => {
            // Update payment proof status
            await tx.paymentProof.update({
                where: { id: parseInt(id) },
                data: {
                    status: 'REJECTED',
                    adminId,
                    adminNote,
                    processedAt: new Date()
                }
            });

            // Create notification for user
            await tx.notification.create({
                data: {
                    userId: proof.userId,
                    type: 'SYSTEM',
                    title: 'Payment Rejected ❌',
                    message: `Your payment proof for ₦${proof.amount.toLocaleString()} has been rejected. Reason: ${adminNote}`
                }
            });

            // Create audit log
            await tx.auditLog.create({
                data: {
                    adminId,
                    action: 'PAYMENT_PROOF_REJECTED',
                    targetUserId: proof.userId,
                    details: `Rejected payment proof #${id} for ₦${proof.amount}. Reason: ${adminNote}`
                }
            });
        });

        res.json({ message: 'Payment proof rejected' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reject payment proof' });
    }
});

// ============================================
// CONTRIBUTION ENFORCEMENT SYSTEM
// ============================================

// POST /api/admin/run-enforcement - Manually trigger contribution enforcement
router.post('/run-enforcement', authenticateToken, isSuperAdmin, async (req, res) => {
    try {
        console.log('Manual enforcement triggered by admin:', req.user.userId);
        const result = await enforceContributionPolicy();

        // Create audit log
        await prisma.auditLog.create({
            data: {
                adminId: req.user.userId,
                action: 'MANUAL_ENFORCEMENT_RUN',
                details: `Manually triggered contribution enforcement. Suspended: ${result.suspended}, Banned: ${result.banned}`
            }
        });

        res.json({
            message: 'Enforcement completed successfully',
            ...result
        });
    } catch (error) {
        console.error('Error running enforcement:', error);
        res.status(500).json({ error: 'Failed to run enforcement' });
    }
});

// GET /api/admin/enforcement-stats - Get enforcement statistics
router.get('/enforcement-stats', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const stats = await getEnforcementStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching enforcement stats:', error);
        res.status(500).json({ error: 'Failed to fetch enforcement stats' });
    }
});

// GET /api/admin/users/:id/enforcement - Check enforcement status for a specific user
router.get('/users/:id/enforcement', authenticateToken, anyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const status = await checkUserEnforcement(parseInt(id));
        res.json(status);
    } catch (error) {
        console.error('Error checking user enforcement:', error);
        res.status(500).json({ error: 'Failed to check user enforcement status' });
    }
});

export default router;
