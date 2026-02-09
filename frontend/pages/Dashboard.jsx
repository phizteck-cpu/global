import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../axiosClient';
import {
    Zap,
    Anchor,
    Clock,
    Shield,
    ArrowRight,
    ChevronRight,
    AlertCircle,
    Activity,
    TrendingUp,
    Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const res = await axiosClient.get('/dashboard/stats');
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                if (error.response?.status === 401) logout();
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate, logout]);

    const handlePayContribution = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.post('/contributions/pay');
            setMsg(res.data.message);
            const statsRes = await axiosClient.get('/dashboard/stats');
            setStats(statsRes.data);
            setTimeout(() => setMsg(''), 5000);
        } catch (error) {
            setMsg(error.response?.data?.error || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
                <p className="text-primary font-black uppercase tracking-[0.3em] animate-pulse">Synchronizing Ledger...</p>
            </div>
        </div>
    );

    if (!stats) return null;

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-gradient-to-br from-slate-900 to-black p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                        <Zap size={18} />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Control Terminal v3.2</span>
                    </div>
                    <div>
                        <h2 className="text-5xl font-black font-heading text-white tracking-tighter leading-none mb-2">
                            Welcome, <span className="text-gradient-gold">{user?.firstName}</span>
                        </h2>
                        <div className="flex items-center gap-4">
                            <p className="text-noble-gray font-mono text-xs tracking-widest uppercase">Member ID: {stats.memberId}</p>
                            <span className="w-1 h-1 bg-noble-gray rounded-full opacity-30"></span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white tracking-widest">{stats.tier} Tier</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-right space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-noble-gray">CaxiosClienttal Liquidity</p>
                    <h3 className="text-4xl font-black font-heading text-white tracking-tighter">₦{stats.walletBalance?.toLocaleString()}</h3>
                    <button onClick={() => navigate('/wallet')} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline flex items-center justify-end gap-2 w-full">
                        Expand Wallet <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {msg && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-sm font-bold flex items-center gap-3 backdrop-blur-md"
                    >
                        <AlertCircle size={18} />
                        {msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Metrics Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <DashboardStat
                    label="Secured Assets"
                    value={`₦${stats.contributionBalance?.toLocaleString()}`}
                    icon={<Anchor size={20} />}
                    sub="Total Cumulative Contribution"
                    color="text-primary"
                />
                <DashboardStat
                    label="Business Volume"
                    value={stats.bvBalance}
                    icon={<Activity size={20} />}
                    sub="Activity Influence Points"
                    color="text-amber-500"
                />
                <DashboardStat
                    label="Verification Protocol"
                    value={stats.eligibilityStatus}
                    icon={stats.eligibilityStatus === 'ELIGIBLE' ? <Shield size={20} /> : <Lock size={20} />}
                    sub={stats.daysRemainingInLock > 0 ? `Lock release in ${stats.daysRemainingInLock} days` : "Institutional Vested Status"}
                    color={stats.eligibilityStatus === 'ELIGIBLE' ? 'text-emerald-400' : 'text-red-500'}
                />
            </div>

            {/* Contribution Progress Control */}
            <div className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={120} className="text-white" />
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10 mb-10">
                    <div>
                        <h3 className="text-2xl font-black font-heading text-white tracking-tight">Active Contribution Cycle</h3>
                        <p className="text-xs text-noble-gray uppercase tracking-widest font-bold mt-1">45-Week Institutional Program</p>
                    </div>
                    <div className="text-right">
                        <span className="text-4xl font-black font-heading text-white">{stats.weeksCompleted}</span>
                        <span className="text-noble-gray font-black text-xl ml-2">/ {stats.totalWeeks} Weeks</span>
                    </div>
                </div>

                <div className="relative h-4 bg-white/5 rounded-full overflow-hidden mb-12 border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.weeksCompleted / stats.totalWeeks) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] relative"
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </motion.div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
                        <Clock size={16} className="text-primary" />
                        <div>
                            <p className="text-[10px] uppercase font-black text-noble-gray">Next Obligation</p>
                            <p className="text-sm font-bold text-white leading-none mt-1">Week {stats.weeksCompleted + 1}</p>
                        </div>
                    </div>

                    <button
                        onClick={handlePayContribution}
                        disabled={stats.weeksCompleted >= 45 || loading}
                        className="bg-white text-black hover:bg-primary hover:text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-tighter text-lg shadow-2xl transition-all active:scale-[0.98] disabled:opacity-30 flex items-center gap-3"
                    >
                        Execute Contribution <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <AlertCircle size={24} />
                </div>
                <div className="space-y-1">
                    <h4 className="font-black text-white uppercase tracking-widest text-[10px]">Security Briefing</h4>
                    <p className="text-xs text-noble-gray italic leading-relaxed">Transactions are processed through the ValueHills secure cooperative ledger. Always verify your current active tier before executing caxiosClienttal transfers.</p>
                </div>
            </div>
        </div>
    );
};

const DashboardStat = ({ label, value, icon, sub, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="glass-card p-8 rounded-[2.5rem] border-white/5 group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            {icon}
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 ${color}`}>
                {icon}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-noble-gray mb-1">{label}</p>
            <h3 className={`text-3xl font-black font-heading tracking-tighter mb-2 ${color === 'text-white' ? 'text-white' : ''}`}>{value}</h3>
            <p className="text-[10px] text-noble-gray font-medium italic">{sub}</p>
        </div>
    </motion.div>
);

export default Dashboard;
