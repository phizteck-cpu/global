import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
    Users,
    Anchor,
    Briefcase,
    AlertCircle,
    ShieldCheck,
    Activity,
    TrendingUp,
    Zap,
    Cpu,
    ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminOverview = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalAssets: 0, companyRevenue: 0, pendingApprovals: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const metrics = [
        { label: 'Total Membership', value: stats.totalUsers, icon: Users, color: 'text-primary', sub: '+12% this month', trend: 'up' },
        { label: 'Cooperative Assets', value: `₦${stats.totalAssets?.toLocaleString()}`, icon: Anchor, color: 'text-emerald-400', sub: 'Member Capital', trend: 'stable' },
        { label: 'Institutional Revenue', value: stats.companyRevenue ? `₦${stats.companyRevenue?.toLocaleString()}` : "₦0", icon: Briefcase, color: 'text-secondary', sub: 'Fees Collected', trend: 'up' },
        { label: 'Pending Payouts', value: stats.pendingApprovals, icon: AlertCircle, color: 'text-red-500', sub: 'Action Required', trend: 'critical' },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Command Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-gradient-to-br from-surface to-background p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Zap size={18} />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Cooperative Command v3.0</span>
                    </div>
                    <h2 className="text-5xl font-black font-heading text-white tracking-tighter leading-none">Administrative Analytics</h2>
                    <p className="text-noble-gray italic font-light max-w-md">Institutional oversight and fiscal performance reporting.</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">System Secure</span>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {metrics.map((m, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="glass-card p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-6 text-white/5 pointer-events-none group-hover:text-white/10 transition-colors">
                            <m.icon size={64} />
                        </div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 ${m.color}`}>
                                <m.icon size={20} />
                            </div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-noble-gray mb-1">{m.label}</p>
                            <h3 className="text-3xl font-black text-white font-heading tracking-tighter mb-4">{m.value}</h3>
                            <div className="flex items-center gap-2">
                                {m.trend === 'up' && <TrendingUp size={12} className="text-emerald-500" />}
                                <span className={`text-[10px] font-bold ${m.trend === 'critical' ? 'text-red-500' : 'text-noble-gray'}`}>{m.sub}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Analytics Placeholder */}
                <div className="lg:col-span-8 glass-card p-10 rounded-[3rem] border-white/5 min-h-[400px] flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10">
                        <h4 className="text-xl font-black text-white font-heading tracking-tight mb-2">Growth Projection</h4>
                        <p className="text-xs text-noble-gray italic">Quarterly member acquisition and asset accumulation trends.</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center opacity-20 group-hover:opacity-30 transition-opacity">
                        <Activity size={100} className="text-primary" />
                    </div>
                    <div className="flex justify-between items-center relative z-10">
                        <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-2">
                            View Detailed Ledger <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>

                {/* System Health */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-[3rem] border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-8">
                            <Cpu size={20} className="text-secondary" />
                            <h4 className="text-lg font-black text-white font-heading uppercase tracking-tighter">System Health</h4>
                        </div>
                        <div className="space-y-6">
                            <HealthItem label="API Response" efficiency="99.9%" />
                            <HealthItem label="Security Firewall" status="Active" />
                            <HealthItem label="Database Latency" efficiency="12ms" />
                            <HealthItem label="Automation Worker" status="Running" />
                        </div>
                    </div>

                    <div className="bg-primary p-8 rounded-[3rem] text-background flex flex-col justify-between h-48 relative overflow-hidden group">
                        <div className="absolute right-0 bottom-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={120} />
                        </div>
                        <div>
                            <h5 className="font-black uppercase tracking-[0.2em] text-[10px] mb-2">Security Protocol</h5>
                            <p className="text-xl font-black font-heading leading-tight">Multi-Factor Biometric Auth Implemented</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HealthItem = ({ label, efficiency, status }) => (
    <div className="flex justify-between items-center">
        <span className="text-xs text-noble-gray font-medium uppercase tracking-widest">{label}</span>
        <span className="text-xs font-black text-white font-mono">{efficiency || status}</span>
    </div>
);

export default AdminOverview;
