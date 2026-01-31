import React, { useEffect, useState } from 'react';
import api from '../../api';
import {
    ShieldCheck,
    Settings,
    Trash2,
    UserPlus,
    Terminal,
    Lock,
    Info,
    RefreshCcw,
    Activity,
    Building2,
    CreditCard,
    User,
    Save,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Company Bank Settings State
    const [bankSettings, setBankSettings] = useState({
        bankName: '',
        accountNumber: '',
        accountName: ''
    });
    const [bankLoading, setBankLoading] = useState(true);
    const [bankSaving, setBankSaving] = useState(false);
    const [bankSuccess, setBankSuccess] = useState('');
    const [bankError, setBankError] = useState('');

    const fetchAdmins = async () => {
        setIsRefreshing(true);
        try {
            const res = await api.get('/admin/users');
            const filteredAdmins = res.data.filter(u => u.role !== 'MEMBER');
            setAdmins(filteredAdmins);
        } catch (err) {
            setError('Failed to fetch administrative directory.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchBankSettings = async () => {
        try {
            const res = await api.get('/admin/company-settings');
            setBankSettings(res.data);
        } catch (err) {
            setBankError('Failed to load company bank settings.');
        } finally {
            setBankLoading(false);
        }
    };

    const handleBankSettingChange = (field, value) => {
        setBankSettings(prev => ({ ...prev, [field]: value }));
        setBankSuccess('');
        setBankError('');
    };

    const saveBankSettings = async () => {
        setBankSaving(true);
        setBankError('');
        setBankSuccess('');
        try {
            await api.put('/admin/company-settings', bankSettings);
            setBankSuccess('Company bank settings updated successfully!');
        } catch (err) {
            setBankError('Failed to save bank settings. Please try again.');
        } finally {
            setBankSaving(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
        fetchBankSettings();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header / Command Center */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-gradient-to-br from-slate-900 to-black p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3 text-red-500 mb-2">
                        <Terminal size={20} />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Secure Terminal v2.4</span>
                    </div>
                    <h2 className="text-5xl font-black font-heading text-white tracking-tighter leading-none">Admin Control Room</h2>
                    <p className="text-noble-gray italic font-light max-w-md">Governance oversight and administrative staff directory.</p>
                </div>

                <div className="relative z-10 flex gap-4">
                    <button
                        onClick={fetchAdmins}
                        className={`p-4 bg-white/5 border border-white/10 rounded-2xl text-noble-gray hover:text-white transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCcw size={20} />
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-tighter text-sm transition-all shadow-xl shadow-red-500/10 active:scale-95 flex items-center gap-3">
                        <UserPlus size={18} />
                        Onboard Staff
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3">
                    <Info size={18} />
                    {error}
                </div>
            )}

            {/* Company Bank Settings Section */}
            <div className="bg-gradient-to-br from-emerald-900/20 to-black p-10 rounded-[3rem] border border-emerald-500/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] -z-0 translate-x-1/3 -translate-y-1/3"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Building2 size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black font-heading text-white tracking-tight">Company Bank Settings</h3>
                            <p className="text-sm text-noble-gray">Configure the company's bank account for receiving payments</p>
                        </div>
                    </div>

                    {bankLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {bankSuccess && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-3 animate-fade-in">
                                    <CheckCircle2 size={18} />
                                    {bankSuccess}
                                </div>
                            )}
                            {bankError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3 animate-fade-in">
                                    <AlertCircle size={18} />
                                    {bankError}
                                </div>
                            )}

                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Bank Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-noble-gray ml-1 flex items-center gap-2">
                                        <Building2 size={14} />
                                        Bank Name
                                    </label>
                                    <input
                                        type="text"
                                        value={bankSettings.bankName}
                                        onChange={(e) => handleBankSettingChange('bankName', e.target.value)}
                                        placeholder="e.g. First Bank"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-white placeholder-white/20"
                                    />
                                </div>

                                {/* Account Number */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-noble-gray ml-1 flex items-center gap-2">
                                        <CreditCard size={14} />
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        value={bankSettings.accountNumber}
                                        onChange={(e) => handleBankSettingChange('accountNumber', e.target.value)}
                                        placeholder="e.g. 1234567890"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-white placeholder-white/20"
                                    />
                                </div>

                                {/* Account Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-noble-gray ml-1 flex items-center gap-2">
                                        <User size={14} />
                                        Account Name
                                    </label>
                                    <input
                                        type="text"
                                        value={bankSettings.accountName}
                                        onChange={(e) => handleBankSettingChange('accountName', e.target.value)}
                                        placeholder="e.g. ValueHills Ltd"
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-white placeholder-white/20"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={saveBankSettings}
                                    disabled={bankSaving}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all shadow-xl shadow-emerald-500/10 active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {bankSaving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Bank Settings
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence>
                    {admins.map((admin) => (
                        <motion.div
                            key={admin.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-between group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/5 transition-all"></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-black font-heading text-2xl text-white group-hover:border-red-500/50 transition-colors">
                                        {admin.fullName?.[0] || 'A'}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-white/5 rounded-xl text-noble-gray hover:text-white transition-all" title="Edit Permissions">
                                            <Settings size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-red-500/10 rounded-xl text-noble-gray hover:text-red-500 transition-all" title="Revoke Credentials">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-2xl font-black text-white leading-tight font-heading mb-1">{admin.fullName}</h4>
                                    <p className="text-xs text-noble-gray font-mono">{admin.email}</p>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${admin.role === 'SUPERADMIN'
                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                    : admin.role === 'FINANCE_ADMIN'
                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                    }`}>
                                    {admin.role.replace('_', ' ')}
                                </span>

                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-noble-gray">
                                    <Activity size={12} className="text-emerald-500 animate-pulse" />
                                    Active Now
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Security Briefing Section */}
            <div className="bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden">
                <div className="absolute bottom-0 right-0 p-12 text-white/5 pointer-events-none">
                    <ShieldCheck size={200} />
                </div>

                <div className="max-w-3xl relative z-10 space-y-8">
                    <div className="flex items-center gap-3 text-red-500">
                        <Lock size={24} />
                        <h3 className="text-2xl font-black font-heading tracking-tight text-white">Governance Policy Briefing</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <PolicyItem icon={<ShieldCheck size={16} />} title="RBAC Enforcement" desc="Only Super Admins may alter administrative role assignments." />
                            <PolicyItem icon={<Terminal size={16} />} title="Audit Imprints" desc="Every transaction and status change is logged in the permanent ledger." />
                        </div>
                        <div className="space-y-4">
                            <PolicyItem icon={<Lock size={16} />} title="Financial Isolation" desc="Finance Admins cannot modify inventory or user membership status." />
                            <PolicyItem icon={<Activity size={16} />} title="System integrity" desc="Accounts are automatically locked after three failed biometric/key attempts." />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PolicyItem = ({ icon, title, desc }) => (
    <div className="flex gap-4 group">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-noble-gray group-hover:bg-red-500/10 group-hover:text-red-500 transition-all shrink-0">
            {icon}
        </div>
        <div>
            <h5 className="text-sm font-black text-white uppercase tracking-widest mb-1">{title}</h5>
            <p className="text-xs text-noble-gray leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default AdminManagement;

