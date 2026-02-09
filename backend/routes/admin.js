import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';
import { authenticateToken, isSuperAdmin, isAdmin, isFinance, isOps, anyAdmin } from '../middleware/auth.js';

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
        const { status, kycStatus } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                ...(status && { status }),
                ...(kycStatus && { kycStatus })
            }
        });

        await prisma.auditLog.create({
            data: {
                adminId: req.user.id,
                action: 'UPDATE_USER_STATUS',
                details: `Updated user ${id} status: ${status}, KYC: ${kycStatus}`,
                targetUserId: parseInt(id)
            }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user status' });
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
        await prisma.package.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Package deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete package' });
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

export default router;
