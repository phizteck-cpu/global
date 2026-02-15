import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { data } = await axiosClient.post('/auth/forgot-password', { email });
            setMessage(data.message || 'If an account exists with that email, a reset link has been sent.');
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
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
                        <span className="text-noble-green">Reset</span> <span className="text-noble-gold">Password</span>
                    </h1>
                    <p className="text-slate-600">Enter your email to receive recovery instructions.</p>
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
                        <label className="text-sm font-medium text-slate-600 ml-1">Email Address</label>
                        <div className="group relative">
                            <input
                                type="email"
                                required
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-noble-gold/50 focus:border-noble-gold/50 outline-none transition-all"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-noble-green to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-500">
                    Remember your password? <Link to="/login" className="text-noble-gold font-semibold hover:text-amber-400 transition-colors">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
