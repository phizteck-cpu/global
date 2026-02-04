import React, { useState, useEffect } from 'react';
import api from '../../api';
import {
    ShieldAlert,
    UserPlus,
    ShieldCheck,
    ShieldX,
    Terminal,
    Key,
    Activity,
    Search,
    UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAdmin, setNewAdmin] = useState({ fullName: '', email: '', username: '', password: '', role: 'ADMIN' });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/admin/staff');
            setAdmins(res.data);
        } catch (error) {
            console.error('Failed to fetch staff');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/register', newAdmin);
            setMsg('New Staff Account Provisioned Successfully.');
            setShowAddModal(false);
            setNewAdmin({ fullName: '', email: '', username: '', password: '', role: 'ADMIN' });
            fetchAdmins();
            setTimeout(() => setMsg(''), 5000);
        } catch (error) {
            setMsg(error.response?.data?.error || 'Provisioning failed.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Security Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-gradient-to-br from-red-950/40 to-black p-10 rounded-[3rem] border border-red-500/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3 text-red-500 mb-2">
                        <ShieldAlert size={18} />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Institutional Security Terminal</span>
                    </div>
                    <h2 className="text-5xl font-black font-heading text-white tracking-tighter leading-none">Staff Management</h2>
                    <p className="text-noble-gray italic font-light max-w-md">Authorized personnel oversight and role-based access control.</p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="relative z-10 py-4 px-8 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-tighter rounded-2xl shadow-xl shadow-red-900/40 transition-all flex items-center gap-3 active:scale-95"
                >
                    <UserPlus size={18} /> Provision Staff
                </button>
            </div>

            {msg && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 font-bold text-sm ${msg.includes('Success') ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    <Terminal size={18} />
                    {msg}
                </div>
            )}

            {/* Staff Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-premium">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr className="text-noble-gray">
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Personnel</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Role Designation</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Access Level</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-right">Operational Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {admins.map((staff) => (
                                <tr key={staff.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-red-500/50 transition-colors">
                                                <UserCircle className="text-noble-gray group-hover:text-red-500 transition-colors" size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-lg">{staff.fullName}</p>
                                                <div className="flex gap-2 text-xs text-noble-gray font-mono">
                                                    <span>@{staff.username}</span>
                                                    <span>|</span>
                                                    <span>{staff.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${staff.role === 'SUPERADMIN' ? 'bg-red-600/10 text-red-500 border-red-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-500/20'}`}>
                                            {staff.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-noble-gray">
                                            <Key size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest italic font-mono">ENCRYPTED_AUTH_PASS</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-emerald-500 font-black uppercase text-[10px] tracking-widest">
                                            <Activity size={12} /> ACTIVE SESSION
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Provisioning Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#0f1012] border border-red-500/20 p-10 rounded-[3rem] max-w-lg w-full shadow-[0_0_100px_rgba(220,38,38,0.1)]"
                        >
                            <div className="mb-8">
                                <h3 className="text-3xl font-black font-heading text-white tracking-tighter">Personnel Provisioning</h3>
                                <p className="text-noble-gray text-sm mt-1">Credentials will be encrypted upon submission.</p>
                            </div>

                            <form onSubmit={handleAddAdmin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">Full Identity</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-red-500/50 outline-none text-sm font-bold transition-all"
                                        placeholder="James Holden"
                                        value={newAdmin.fullName}
                                        onChange={e => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">Operational Email</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-red-500/50 outline-none text-sm font-bold transition-all"
                                            placeholder="james.h@valuehills.io"
                                            value={newAdmin.email}
                                            onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">System Username</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-red-500/50 outline-none text-sm font-bold transition-all"
                                            placeholder="j_holden"
                                            value={newAdmin.username}
                                            onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">Temporary Access Key</label>
                                    <input
                                        required
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-red-500/50 outline-none text-sm font-bold transition-all"
                                        placeholder="••••••••"
                                        value={newAdmin.password}
                                        onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">Authority Level</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-red-500/50 outline-none text-sm font-bold transition-all appearance-none"
                                        value={newAdmin.role}
                                        onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}
                                    >
                                        <option value="ADMIN" className="bg-surface">STANDARD ADMIN</option>
                                        <option value="SUPERADMIN" className="bg-surface">SUPER ADMIN</option>
                                        <option value="FINANCE_ADMIN" className="bg-surface">FINANCE OFFICER</option>
                                        <option value="OPS_ADMIN" className="bg-surface">OPERATIONS LEAD</option>
                                        <option value="SUPPORT_ADMIN" className="bg-surface">SUPPORT LEAD</option>
                                    </select>
                                </div>

                                <div className="flex gap-6 mt-10">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 text-noble-gray font-black uppercase tracking-widest text-xs hover:text-white transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-2 py-4 px-10 bg-red-600 text-white font-black uppercase tracking-tighter rounded-2xl shadow-xl shadow-red-900/20 hover:bg-red-500 active:scale-[0.98] transition-all"
                                    >
                                        Authorize Access
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminManagement;
