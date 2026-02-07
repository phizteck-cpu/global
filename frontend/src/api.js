import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ============================================
// Auth Endpoints
// ============================================

export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
};

export const signup = async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
};

export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
};

export const refreshToken = async () => {
    const response = await api.post('/auth/refresh-token');
    return response.data;
};

export const confirmEmail = async (token) => {
    const response = await api.get(`/auth/confirm-email/${token}`);
    return response.data;
};

// ============================================
// User Endpoints
// ============================================

export const getProfile = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const updateProfile = async (userData) => {
    const response = await api.patch('/users/me', userData);
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post('/users/me/change-password', { currentPassword, newPassword });
    return response.data;
};

export const updateTransactionPin = async (currentPin, newPin, password) => {
    const response = await api.post('/users/me/update-pin', { currentPin, newPin, password });
    return response.data;
};

export const uploadKYC = async (kycDocUrl) => {
    const response = await api.post('/users/me/kyc', { kycDocUrl });
    return response.data;
};

// ============================================
// Wallet Endpoints
// ============================================

export const getWallet = async () => {
    const response = await api.get('/wallet');
    return response.data;
};

export const fundWallet = async (amount) => {
    const response = await api.post('/wallet/fund', { amount });
    return response.data;
};

export const withdrawFromWallet = async (amount, bankName, accountNumber, accountName, pin) => {
    const response = await api.post('/wallet/withdraw', { amount, bankName, accountNumber, accountName, pin });
    return response.data;
};

// ============================================
// Contribution Endpoints
// ============================================

export const getContributions = async () => {
    const response = await api.get('/contributions');
    return response.data;
};

export const payContribution = async () => {
    const response = await api.post('/contributions/pay');
    return response.data;
};

// ============================================
// Dashboard Endpoints
// ============================================

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getRecentTransactions = async () => {
    const response = await api.get('/dashboard/transactions');
    return response.data;
};

// ============================================
// Withdrawal Endpoints
// ============================================

export const requestWithdrawal = async (amount, pin) => {
    const response = await api.post('/withdrawals/request', { amount, pin });
    return response.data;
};

export const getWithdrawals = async () => {
    const response = await api.get('/withdrawals');
    return response.data;
};

export const approveWithdrawal = async (id) => {
    const response = await api.post(`/withdrawals/approve/${id}`);
    return response.data;
};

export const rejectWithdrawal = async (id, reason) => {
    const response = await api.post(`/withdrawals/reject/${id}`, { reason });
    return response.data;
};

// ============================================
// Bonus Endpoints
// ============================================

export const getBonuses = async () => {
    const response = await api.get('/bonuses');
    return response.data;
};

export const getPendingBonuses = async () => {
    const response = await api.get('/bonuses/pending');
    return response.data;
};

// ============================================
// Referral Endpoints
// ============================================

export const getReferrals = async () => {
    const response = await api.get('/referrals');
    return response.data;
};

export const getReferralStats = async () => {
    const response = await api.get('/referrals/stats');
    return response.data;
};

export const getReferralTree = async () => {
    const response = await api.get('/referrals/tree');
    return response.data;
};

// ============================================
// Package/Tier Endpoints
// ============================================

export const getPackages = async () => {
    const response = await api.get('/packages');
    return response.data;
};

export const getPackageById = async (id) => {
    const response = await api.get(`/packages/${id}`);
    return response.data;
};

export const selectPackage = async (tierId) => {
    const response = await api.post('/packages/select', { tierId });
    return response.data;
};

// ============================================
// Redemption Endpoints
// ============================================

export const getRedemptions = async () => {
    const response = await api.get('/redemptions');
    return response.data;
};

export const createRedemption = async (redemptionData) => {
    const response = await api.post('/redemptions', redemptionData);
    return response.data;
};

export const updateRedemptionStatus = async (id, status) => {
    const response = await api.put(`/redemptions/${id}/status`, { status });
    return response.data;
};

// ============================================
// Notification Endpoints
// ============================================

export const getNotifications = async () => {
    const response = await api.get('/notifications');
    return response.data;
};

export const markNotificationAsRead = async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsAsRead = async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
};

export const getUnreadNotificationCount = async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
};

// ============================================
// Admin Endpoints
// ============================================

// Admin Auth
export const adminLogin = async (username, password) => {
    const response = await api.post('/admin/login', { username, password });
    return response.data;
};

// Admin Stats
export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

// Admin Users
export const getAdminUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

export const getAdminUserById = async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
};

export const updateUserStatus = async (id, status) => {
    const response = await api.patch(`/admin/users/${id}/status`, { status });
    return response.data;
};

export const updateUserKYC = async (id, status) => {
    const response = await api.patch(`/admin/users/${id}/kyc`, { status });
    return response.data;
};

// Admin Audit Logs
export const getAuditLogs = async () => {
    const response = await api.get('/admin/audit-logs');
    return response.data;
};

// Admin Approvals
export const getPendingApprovals = async () => {
    const response = await api.get('/admin/approvals');
    return response.data;
};

export const approveUser = async (id) => {
    const response = await api.post(`/admin/approvals/${id}/approve`);
    return response.data;
};

export const rejectUser = async (id, reason) => {
    const response = await api.post(`/admin/approvals/${id}/reject`, { reason });
    return response.data;
};

// Admin Packages
export const getAdminPackages = async () => {
    const response = await api.get('/admin/packages');
    return response.data;
};

export const createPackage = async (packageData) => {
    const response = await api.post('/admin/packages', packageData);
    return response.data;
};

export const updatePackage = async (id, packageData) => {
    const response = await api.put(`/admin/packages/${id}`, packageData);
    return response.data;
};

export const deletePackage = async (id) => {
    const response = await api.delete(`/admin/packages/${id}`);
    return response.data;
};

// Admin Withdrawals
export const getAdminWithdrawals = async () => {
    const response = await api.get('/admin/withdrawals');
    return response.data;
};

export const processWithdrawal = async (id, action, reason) => {
    const response = await api.post(`/admin/withdrawals/${id}/${action}`, { reason });
    return response.data;
};

// Admin Inventory
export const getInventory = async () => {
    const response = await api.get('/admin/inventory');
    return response.data;
};

export const updateInventory = async (id, data) => {
    const response = await api.put(`/admin/inventory/${id}`, data);
    return response.data;
};

export default api;
