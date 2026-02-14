import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../axiosClient';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axiosClient.post('/auth/reset-password', {
                token,
                password // Keeping consistent with backend expectations
            });
            setMessage(data.message || 'Password reset successful!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-noble-gradient px-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-noble-green/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-noble-gold/10 rounded-full blur-[100px]" />

            <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-xl relative z-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold font-heading mb-2">
                        <span className="text-noble-green">New</span> <span className="text-noble-gold">Password</span>
                    </h1>
                    <p className="text-slate-600">Enter your new password below.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 text-red-700 text-sm rounded-xl border border-red-500/20 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                        {error}
                    </div>
                )}
                {message && (
                    <div className="mb-6 p-4 bg-green-500/10 text-green-700 text-sm rounded-xl border border-green-500/20 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 ml-1">New Password</label>
                        <div className="group relative">
                            <input
                                type="password"
                                required
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-noble-gold/50 focus:border-noble-gold/50 outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-600 ml-1">Confirm Password</label>
                        <div className="group relative">
                            <input
                                type="password"
                                required
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-noble-gold/50 focus:border-noble-gold/50 outline-none transition-all"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-noble-green to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Reseting...' : 'Set New Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
