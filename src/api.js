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
// Package Endpoints
// ============================================

export const getPackages = async () => {
    const response = await api.get('/packages');
    return response.data;
};

export const getPackageById = async (id) => {
    const response = await api.get(`/packages/${id}`);
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

export default api;
