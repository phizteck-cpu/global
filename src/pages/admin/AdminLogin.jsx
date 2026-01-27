import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            const adminRoles = ['ADMIN', 'SUPERADMIN', 'FINANCE_ADMIN', 'OPS_ADMIN', 'SUPPORT_ADMIN'];
            if (adminRoles.includes(result.role)) {
                navigate('/admin');
            } else {
                setError('Access Denied: This portal is for administrative staff only.');
                // Optionally logout? For now just show error.
            }
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#020617] text-white selection:bg-red-500">
            {/* Left Side: Visual/Context */}
            <div className="hidden lg:flex flex-col justify-center p-20 bg-gradient-to-br from-slate-900 to-black border-r border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

                <div className="relative z-10 space-y-6">
                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/10">
                        <ShieldCheck size={40} />
                    </div>
                    <h1 className="text-6xl font-black font-heading tracking-tighter leading-none">
                        Administrative <br />
                        <span className="text-red-500">Control Portal</span>
                    </h1>
                    <p className="text-xl text-noble-gray font-light max-w-md leading-relaxed">
                        Secure access to ValueHills core infrastructure. Every action performed within this terminal is recorded and audited.
                    </p>

                    <div className="pt-10 flex gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-red-500 font-bold text-2xl">256-bit</span>
                            <span className="text-[10px] uppercase tracking-widest text-noble-gray">Encryption</span>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="flex flex-col gap-1">
                            <span className="text-white font-bold text-2xl">Zero</span>
                            <span className="text-[10px] uppercase tracking-widest text-noble-gray">Trust Network</span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-10 left-20 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">
                    System Version v2.4.0-SECURITY_HARDENED
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex items-center justify-center p-8 relative">
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-md w-full space-y-8 relative z-10">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold font-heading tracking-tight">Staff Authentication</h2>
                        <p className="text-noble-gray text-sm">Please enter your institutional credentials.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-shake">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-noble-gray ml-1">Work Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-noble-gray group-focus-within:text-red-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all text-white placeholder-white/20"
                                    placeholder="admin_username"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold uppercase tracking-widest text-noble-gray ml-1">Access Key</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-noble-gray group-focus-within:text-red-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-red-500/50 focus:ring-4 focus:ring-red-500/5 transition-all text-white placeholder-white/20"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-white text-black font-black uppercase tracking-tighter text-lg rounded-xl hover:bg-red-500 hover:text-white transition-all transform active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Decrypting Security Layer...' : 'Initialize Terminal'}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-white/5 text-center">
                        <p className="text-xs text-noble-gray leading-relaxed">
                            UNAUTHORIZED ACCESS IS PROHIBITED. <br />
                            IP ADDRESS: <span className="text-white font-mono">127.0.0.1</span> HAS BEEN LOGGED.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
