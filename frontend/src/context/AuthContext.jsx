import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token on load
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Try member login first
            let res;
            try {
                res = await api.post('/auth/login', { username, password });
            } catch (authError) {
                // If member login fails, try admin login
                res = await api.post('/admin/login', { username, password });
            }
            
            // Check if response indicates success
            const token = res.data.accessToken || res.data.token;
            if (!token) {
                return {
                    success: false,
                    message: res.data.message || 'Login failed. Please try again.'
                };
            }
            
            const userData = res.data.user || { 
                id: res.data.userId || res.data.id,
                role: res.data.role,
                username: username,
                firstName: 'Admin',
                lastName: 'User'
            };
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            return { success: true, role: userData.role };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                (error.request ? 'Cannot reach server. Please try again.' : 'Login failed');
            return {
                success: false,
                message
            };
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/auth/signup', userData);
            const token = res.data.accessToken || res.data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setUser(null);
    };

    const impersonate = async (userId) => {
        try {
            const adminToken = localStorage.getItem('token');
            const adminUser = localStorage.getItem('user');

            // Save admin session
            localStorage.setItem('adminToken', adminToken);
            localStorage.setItem('adminUser', adminUser);

            const res = await api.post(`/admin/impersonate/${userId}`);

            // Switch to user session
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);

            return { success: true };
        } catch (error) {
            return { success: false, message: 'Impersonation failed' };
        }
    };

    const stopImpersonating = () => {
        const adminToken = localStorage.getItem('adminToken');
        const adminUser = localStorage.getItem('adminUser');

        if (adminToken && adminUser) {
            localStorage.setItem('token', adminToken);
            localStorage.setItem('user', adminUser);
            setUser(JSON.parse(adminUser));
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            return true;
        }
        return false;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, impersonate, stopImpersonating }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
