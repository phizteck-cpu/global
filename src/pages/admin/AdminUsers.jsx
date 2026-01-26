import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
    Users,
    Shield,
    Wallet,
    Activity,
    Search,
    ChevronRight,
    UserCheck,
    MoreVertical,
    X,
    ShieldCheck,
    UserX,
    UserMinus,
    ArrowUpCircle,
    Calendar,
    Globe,
    Terminal,
    Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
    const { impersonate, user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = async (user) => {
        setSelectedUser(user);
        try {
            const res = await api.get(`/admin/users/${user.id}`);
            setProfileData(res.data);
            setShowProfile(true);
        } catch (error) {
            console.error('Error fetching profile details');
        }
    };

    const handleUpdateStatus = async (status, kycVerified) => {
        setActionLoading(true);
        try {
            await api.patch(`/admin/users/${selectedUser.id}/status`, { status, kycVerified });
            fetchUsers();
            setShowActions(false);
            if (showProfile) {
                const res = await api.get(`/admin/users/${selectedUser.id}`);
                setProfileData(res.data);
            }
        } catch (error) {
            console.error('Action failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleImpersonateIdEnity = async () => {
        setActionLoading(true);
        const res = await impersonate(selectedUser.id);
        if (res.success) {
            navigate('/dashboard');
        } else {
            console.error(res.message);
        }
        setActionLoading(false);
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Members', value: users.filter(u => u.role === 'MEMBER').length, icon: Users, color: 'text-primary' },
        { label: 'Active Packages', value: users.filter(u => u.userPackages?.some(p => p.status === 'ACTIVE')).length, icon: Activity, color: 'text-secondary' },
        { label: 'Total Internal Assets', value: '₦' + users.reduce((acc, u) => acc + (u.wallet?.lockedBalance || 0), 0).toLocaleString(), icon: Wallet, color: 'text-emerald-400' },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-5xl font-black font-heading text-white tracking-tighter">Entity Records</h2>
                    <p className="text-noble-gray mt-2 italic font-light">Global member registry and institutional identity oversight terminal.</p>
                </div>

                <div className="relative group w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-noble-gray group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Scan registry by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold"
                    />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-card p-8 rounded-[2.5rem] border-white/5 flex items-center gap-6 group hover:border-white/10 transition-colors">
                        <div className={`w-16 h-16 rounded-2xl bg-white/0.02 flex items-center justify-center border border-white/5 group-hover:bg-white/5 transition-all ${stat.color}`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-noble-gray mb-1">{stat.label}</p>
                            <h4 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Members Table */}
            <div className="glass-card rounded-[3rem] overflow-hidden border-white/5 shadow-premium mt-8 bg-slate-900/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr className="text-noble-gray">
                                <th className="px-10 py-8 text-[10px] uppercase tracking-[0.3em] font-black">Entity Identity</th>
                                <th className="px-10 py-8 text-[10px] uppercase tracking-[0.3em] font-black">Status & Tier</th>
                                <th className="px-10 py-8 text-[10px] uppercase tracking-[0.3em] font-black text-right">Portfolio Value</th>
                                <th className="px-10 py-8 text-[10px] uppercase tracking-[0.3em] font-black text-center">Auth Level</th>
                                <th className="px-10 py-8 text-[10px] uppercase tracking-[0.3em] font-black text-right">Terminal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="group hover:bg-white/[0.02] transition-all">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-black font-heading text-xl text-white group-hover:border-primary/50 transition-colors">
                                                {u.fullName?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-white tracking-tight leading-none">{u.fullName}</p>
                                                <p className="text-xs text-noble-gray mt-2 font-mono tracking-tighter italic">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col gap-3">
                                            {u.userPackages?.[0]?.package ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{u.userPackages[0].package.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] uppercase tracking-widest text-noble-gray/40 font-black">Vault Inactive</span>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Fingerprint size={12} className={u.kycVerified ? "text-emerald-400" : "text-amber-500"} />
                                                <span className={`text-[10px] uppercase tracking-widest font-black ${u.kycVerified ? "text-emerald-400" : "text-amber-400 opacity-60"}`}>
                                                    {u.kycVerified ? 'Verified Identity' : 'Pending Audit'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="space-y-1">
                                            <p className="text-2xl font-black font-heading text-white tracking-tighter leading-none">
                                                ₦{u.wallet?.lockedBalance?.toLocaleString() || '0'}
                                            </p>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-noble-gray font-black italic">Locked Capital</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex justify-center">
                                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg ${u.role === 'SUPERADMIN'
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                : u.role === 'MEMBER'
                                                    ? 'bg-white/5 text-noble-gray border-white/5'
                                                    : 'bg-primary/10 text-primary border-primary/20'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleViewProfile(u)}
                                                className="p-3 bg-white/5 hover:bg-primary hover:text-white text-noble-gray rounded-xl transition-all shadow-xl group/btn"
                                                title="Entity Dossier"
                                            >
                                                <ChevronRight size={20} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedUser(u); setShowActions(true); }}
                                                className="p-3 bg-white/5 hover:bg-white hover:text-black text-noble-gray rounded-xl transition-all shadow-xl"
                                                title="Operational Actions"
                                            >
                                                <Terminal size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Profile Detail Modal */}
            <AnimatePresence>
                {showProfile && profileData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                            onClick={() => setShowProfile(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 40, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 40, opacity: 0 }}
                            className="relative w-full max-w-5xl bg-slate-900 border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
                                <div className="flex items-center gap-8">
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 p-1">
                                        <div className="w-full h-full rounded-[1.2rem] bg-slate-900 flex items-center justify-center text-4xl font-black text-white">
                                            {profileData.fullName?.[0]}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-4xl font-black text-white font-heading tracking-tighter leading-none mb-2">{profileData.fullName}</h3>
                                        <div className="flex items-center gap-4">
                                            <p className="text-noble-gray font-mono text-sm tracking-widest">{profileData.email}</p>
                                            <span className="w-1.5 h-1.5 bg-noble-gray rounded-full opacity-30" />
                                            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">{profileData.role} RECORD</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setShowProfile(false)} className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-noble-gray hover:text-white hover:bg-white/10 transition-all">
                                    <X size={32} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-10 overflow-y-auto space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <ProfileDetailCard label="Electronic Assets" value={`₦${profileData.wallet?.balance?.toLocaleString()}`} sub="Capital Liquidity" icon={<Wallet size={20} />} color="text-emerald-400" />
                                    <ProfileDetailCard label="Cooperative Locked" value={`₦${profileData.wallet?.lockedBalance?.toLocaleString()}`} sub="Secured Savings" icon={<ShieldCheck size={20} />} color="text-primary" />
                                    <ProfileDetailCard label="Referral Network" value={profileData.referrals?.length} sub="Active Geneology" icon={<Globe size={20} />} color="text-amber-500" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Subscription Status */}
                                    <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
                                        <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                                            <ArrowUpCircle size={20} className="text-primary" />
                                            <h4 className="text-lg font-black font-heading uppercase tracking-tight">Active Strategy</h4>
                                        </div>
                                        {profileData.userPackages?.[0] ? (
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-3xl font-black text-white tracking-tighter">{profileData.userPackages[0].package.name}</p>
                                                        <p className="text-[10px] text-noble-gray font-bold uppercase tracking-widest mt-1">Institutional Cycle</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-white">Week {profileData.userPackages[0].weeksPaid} / 45</p>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(profileData.userPackages[0].weeksPaid / 45) * 100}%` }}
                                                        className="h-full bg-primary"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-center text-noble-gray italic py-8">No active fiscal strategy identified.</p>
                                        )}
                                    </div>

                                    {/* Connection Node */}
                                    <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
                                        <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
                                            <Users size={20} className="text-amber-500" />
                                            <h4 className="text-lg font-black font-heading uppercase tracking-tight">Referral Node Members</h4>
                                        </div>
                                        <div className="space-y-4 max-h-48 overflow-y-auto pr-4">
                                            {profileData.referrals?.map((ref, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{ref.refereeUser.fullName}</p>
                                                        <p className="text-[10px] text-noble-gray">{ref.refereeUser.email}</p>
                                                    </div>
                                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">L{ref.level}</p>
                                                </div>
                                            ))}
                                            {profileData.referrals?.length === 0 && <p className="text-center text-noble-gray italic py-4">Node is currently isolated.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Actions Terminal */}
            <AnimatePresence>
                {showActions && selectedUser && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowActions(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl"
                        >
                            <h3 className="text-3xl font-black text-white font-heading tracking-tighter mb-2">Ops Terminal</h3>
                            <p className="text-noble-gray text-sm mb-10">Executing institutional commands for: <span className="text-primary font-bold">{selectedUser.fullName}</span></p>

                            <div className="space-y-4">
                                <ActionButton
                                    label={selectedUser.kycVerified ? "Revoke Verification" : "Authorize Identity (KYC)"}
                                    icon={<ShieldCheck size={20} />}
                                    color={selectedUser.kycVerified ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}
                                    onClick={() => handleUpdateStatus(selectedUser.status, !selectedUser.kycVerified)}
                                    loading={actionLoading}
                                />
                                <ActionButton
                                    label={selectedUser.status === 'ACTIVE' ? "Suspend Entity" : "Activate Entity"}
                                    icon={selectedUser.status === 'ACTIVE' ? <UserX size={20} /> : <UserCheck size={20} />}
                                    color={selectedUser.status === 'ACTIVE' ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-400"}
                                    onClick={() => handleUpdateStatus(selectedUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE', selectedUser.kycVerified)}
                                    loading={actionLoading}
                                />
                                {currentUser?.role === 'SUPERADMIN' && (
                                    <ActionButton
                                        label="Shadow Mode (Impersonate)"
                                        icon={<Activity size={20} />}
                                        color="bg-primary/10 text-primary"
                                        onClick={handleImpersonateIdEnity}
                                        loading={actionLoading}
                                    />
                                )}
                                <button className="w-full p-4 text-[10px] font-black uppercase tracking-widest text-noble-gray hover:text-white transition-all underline underline-offset-4" onClick={() => setShowActions(false)}>
                                    Release Terminal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ProfileDetailCard = ({ label, value, sub, icon, color }) => (
    <div className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center text-center space-y-2 group hover:border-white/10 transition-colors">
        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${color}`}>
            {icon}
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] font-black text-noble-gray italic">{label}</p>
        <h4 className={`text-2xl font-black font-heading ${color === 'text-white' ? 'text-white' : color} tracking-tighter`}>{value}</h4>
        <p className="text-[10px] text-noble-gray/40 font-bold uppercase tracking-widest">{sub}</p>
    </div>
);

const ActionButton = ({ label, icon, color, onClick, loading }) => (
    <button
        disabled={loading}
        onClick={onClick}
        className={`w-full flex items-center justify-between p-6 rounded-2xl border border-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] ${color} ${loading ? 'opacity-50 grayscale' : ''}`}
    >
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
        {icon}
    </button>
);

export default AdminUsers;
