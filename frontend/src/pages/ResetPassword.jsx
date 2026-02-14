import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/auth/reset-password', { token, password });
            setSuccess(true);
            setMessage(res.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10 text-center"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                        <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Password Reset</h1>
                    <p className="text-noble-gray mb-6">{message}</p>
                    <Link
                        to="/login"
                        className="text-primary hover:text-white transition-colors inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Proceed to Login
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
            >
                <Link
                    to="/login"
                    className="text-noble-gray hover:text-primary transition-colors inline-flex items-center gap-2 mb-6 text-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">New Password</h1>
                    <p className="text-noble-gray">Enter your new password below.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 text-red-300 text-sm rounded-xl border border-red-500/30 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-noble-gray ml-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-noble-gray" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full px-5 py-4 pl-12 pr-12 rounded-xl bg-surface border border-white/10 focus:border-primary/50 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="Enter new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-noble-gray hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-noble-gray ml-1">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-noble-gray" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full px-5 py-4 pl-12 rounded-xl bg-surface border border-white/10 focus:border-primary/50 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="w-full py-4 bg-primary text-background rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-glow transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
                                />
                                Resetting...
                            </>
                        ) : (
                            <>
                                <Shield className="w-5 h-5" />
                                Reset Password
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
