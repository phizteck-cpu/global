import React, { useState, useEffect } from 'react';
import axiosClient from '../../axiosClient';
import {
    Plus,
    Layers,
    Settings,
    DollarSign,
    Activity,
    Trash2,
    Info,
    ChevronRight,
    Trophy,
    Shield
} from 'lucide-react';

const AdminPackages = () => {
    const [pkgForm, setPkgForm] = useState({ name: '', weeklyAmount: '', upgradeFee: '', maintenanceFee: '', durationWeeks: '45' });
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        fetchTiers();
    }, []);

    const fetchTiers = async () => {
        try {
            const res = await axiosClient.get('/packages');
            setTiers(res.data.packages);
        } catch (error) {
            console.error('Failed to fetch tiers');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePackage = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/packages', {
                name: pkgForm.name,
                weeklyAmount: parseFloat(pkgForm.weeklyAmount),
                upgradeFee: parseFloat(pkgForm.upgradeFee),
                maintenanceFee: parseFloat(pkgForm.maintenanceFee) || 0,
                durationWeeks: parseInt(pkgForm.durationWeeks) || 45
            });
            setMsg('Tier Architecture Updated Successfully');
            setPkgForm({ name: '', weeklyAmount: '', upgradeFee: '', maintenanceFee: '', durationWeeks: '45' });
            fetchTiers();
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Authorization Failed: Requires Super Admin privileges.');
        }
    };

    const handleDeleteTier = async (tierId) => {
        try {
            await axiosClient.delete(`/admin/packages/${tierId}`);
            setMsg('Tier deleted successfully');
            setDeleteConfirm(null);
            fetchTiers();
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to delete tier';
            setMsg(errorMsg);
            setTimeout(() => setMsg(''), 5000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-gradient-to-br from-slate-900 to-black p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3 text-primary mb-2">
                        <Layers size={18} />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Architecture Terminal v2.4</span>
                    </div>
                    <h2 className="text-5xl font-black font-heading text-white tracking-tighter leading-none">Membership Tiers</h2>
                    <p className="text-noble-gray italic font-light max-w-md">Governance oversight of cooperative contribution packages and escalation fees.</p>
                </div>

                <div className="relative z-10">
                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                        <Trophy size={16} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">{tiers.length} Active Tiers</span>
                    </div>
                </div>
            </div>

            {msg && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 font-bold text-sm ${msg.includes('Success') ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    <Info size={18} />
                    {msg}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Configuration Matrix */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-8">
                            <Plus className="text-primary" size={20} />
                            <h3 className="text-xl font-black font-heading text-white uppercase tracking-tighter">Forge New Tier</h3>
                        </div>

                        <form onSubmit={handleCreatePackage} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ConfigInput
                                label="Tier Designation"
                                icon={<Layers size={14} />}
                                value={pkgForm.name}
                                onChange={e => setPkgForm({ ...pkgForm, name: e.target.value })}
                                placeholder="e.g. Diamond Executive"
                            />
                            <ConfigInput
                                label="Weekly Contribution (₦)"
                                icon={<DollarSign size={14} />}
                                type="number"
                                value={pkgForm.weeklyAmount}
                                onChange={e => setPkgForm({ ...pkgForm, weeklyAmount: e.target.value })}
                                placeholder="5000"
                            />
                            <ConfigInput
                                label="Escalation Fee (₦)"
                                icon={<Settings size={14} />}
                                type="number"
                                value={pkgForm.upgradeFee}
                                onChange={e => setPkgForm({ ...pkgForm, upgradeFee: e.target.value })}
                                placeholder="10000"
                            />
                            <ConfigInput
                                label="Maintenance Reserve (₦)"
                                icon={<Activity size={14} />}
                                type="number"
                                value={pkgForm.maintenanceFee}
                                onChange={e => setPkgForm({ ...pkgForm, maintenanceFee: e.target.value })}
                                placeholder="200"
                            />
                            <ConfigInput
                                label="Maturity Period (Weeks)"
                                icon={<Shield size={14} />}
                                type="number"
                                value={pkgForm.durationWeeks}
                                onChange={e => setPkgForm({ ...pkgForm, durationWeeks: e.target.value })}
                                placeholder="45"
                                helperText="Number of weeks until tier completion"
                            />

                            <div className="md:col-span-2 pt-6">
                                <button className="w-full py-5 bg-white text-black font-black uppercase tracking-tighter rounded-2xl shadow-xl hover:bg-primary hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                                    Deploy Architecture
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Active Registry */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 ml-2">
                            <Layers className="text-noble-gray" size={20} />
                            <h3 className="text-xl font-black font-heading text-white uppercase tracking-tighter">Active Registry</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tiers.map((tier) => (
                                <div key={tier.id} className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-primary/30 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:text-primary transition-colors border border-white/10">
                                            <Trophy size={20} />
                                        </div>
                                        <button 
                                            onClick={() => setDeleteConfirm(tier.id)}
                                            className="p-2 text-noble-gray hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-lg"
                                            title="Delete tier"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <h4 className="text-2xl font-black text-white font-heading tracking-tight mb-4">{tier.name}</h4>
                                    <div className="space-y-3 pt-6 border-t border-white/5">
                                        <RegistryItem label="Subscription" value={`₦${tier.weeklyAmount?.toLocaleString()}/wk`} />
                                        <RegistryItem label="Escalation" value={`₦${tier.upgradeFee?.toLocaleString()}`} />
                                        <RegistryItem label="Duration" value={`${tier.durationWeeks || 45} weeks`} />
                                        <RegistryItem label="Total Value" value={`₦${((tier.weeklyAmount || 0) * (tier.durationWeeks || 45)).toLocaleString()}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {deleteConfirm && (
                        <div
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
                            onClick={() => setDeleteConfirm(null)}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full animate-fade-in"
                            >
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <Trash2 className="text-red-500" size={24} />
                                    </div>
                                    <h5 className="text-white font-bold text-xl">Delete Tier?</h5>
                                    <p className="text-sm text-noble-gray">
                                        Are you sure you want to delete <span className="text-white font-bold">{tiers.find(t => t.id === deleteConfirm)?.name}</span>? 
                                        This action cannot be undone.
                                    </p>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setDeleteConfirm(null)}
                                            className="flex-1 py-3 px-6 bg-white/5 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTier(deleteConfirm)}
                                            className="flex-1 py-3 px-6 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Governance Side Panel */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] space-y-8">
                        <div className="flex items-center gap-3 text-primary">
                            <Shield size={24} />
                            <h3 className="text-xl font-black font-heading text-white tracking-tighter">Governance Rules</h3>
                        </div>
                        <div className="space-y-6">
                            <PolicyItem title="Non-Destructive Editing" desc="Active tiers cannot be deleted if members are currently enrolled. Migrate members before termination." />
                            <PolicyItem title="Fiscal Balance" desc="Weekly contributions must be at least 10x the maintenance reserve to ensure cooperative liquidity." />
                            <PolicyItem title="Escalation Logic" desc="Upgrade fees are immediately realized as institutional revenue upon member confirmation." />
                        </div>
                        <div className="pt-8 border-t border-white/5">
                            <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-noble-gray hover:text-white transition-colors flex items-center justify-center gap-2">
                                Export Schema <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ConfigInput = ({ label, icon, type = 'text', value, onChange, placeholder }) => (
    <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2 flex items-center gap-2">
            {icon} {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold"
        />
    </div>
);

const RegistryItem = ({ label, value }) => (
    <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-widest font-black text-noble-gray">{label}</span>
        <span className="text-sm font-black text-white font-mono">{value}</span>
    </div>
);

const PolicyItem = ({ title, desc }) => (
    <div className="space-y-2">
        <h5 className="text-[10px] uppercase tracking-widest font-black text-white">{title}</h5>
        <p className="text-xs text-noble-gray leading-relaxed font-light italic">{desc}</p>
    </div>
);

export default AdminPackages;
