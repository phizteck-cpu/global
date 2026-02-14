import React, { useState, useEffect } from 'react';
import axiosClient from '../../axiosClient';
import {
    CheckCircle,
    XCircle,
    Banknote,
    Clock,
    User,
    ShieldCheck,
    CreditCard,
    AlertCircle,
    Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminApprovals = () => {
    const [approvalList, setApprovalList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/admin/approvals');
            setApprovalList(res.data);
        } catch (error) {
            console.error('Failed to fetch approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        const confirmMsg = status === 'SUCCESS' ? 'Approve this payout?' : 'Decline this request?';
        if (!window.confirm(confirmMsg)) return;

        try {
            if (status === 'SUCCESS') {
                await axiosClient.post(`/withdrawals/approve/${id}`);
                setMsg('Withdrawal processed successfully.');
            } else {
                await axiosClient.post(`/withdrawals/reject/${id}`);
                setMsg('Withdrawal rejected and refunded.');
            }
            setApprovalList(prev => prev.filter(i => i.id !== id));
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg(error.response?.data?.error || 'Operation failed');
        }
    };

    if (loading && approvalList.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const totalPending = approvalList.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header / Command Center */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-gradient-to-br from-slate-900 to-black p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <Terminal size={18} />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Finance Terminal v1.1</span>
                    </div>
                    <h2 className="text-5xl font-black font-heading text-white tracking-tighter leading-none">Payout Approvals</h2>
                    <p className="text-noble-gray italic font-light max-w-md">Authorized scrutiny for outbound caxiosClienttal transfers.</p>
                </div>

                <div className="relative z-10 flex flex-col items-end">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-noble-gray mb-1">Queue CaxiosClienttalization</p>
                    <h3 className="text-4xl font-black font-heading text-amber-500 tracking-tighter">₦{totalPending.toLocaleString()}</h3>
                </div>
            </div>

            {msg && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 font-bold text-sm ${msg.includes('success') ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    <AlertCircle size={18} />
                    {msg}
                </div>
            )}

            {/* Approvals Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-premium">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr className="text-noble-gray">
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Entity</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Fiscal Payload</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Beneficiary Vault</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-center">Protocol</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-right">Verification</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {approvalList.map((item) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-white border border-white/10 group-hover:border-primary/50 transition-colors">
                                                    {item.user?.firstName?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{item.user?.fullName}</p>
                                                    <p className="text-[10px] text-noble-gray uppercase font-black">{new Date(item.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-2xl font-black font-heading text-white">₦{item.amount.toLocaleString()}</p>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={10} className="text-amber-500" />
                                                    <span className="text-[10px] text-noble-gray uppercase font-bold tracking-widest">{item.type}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard size={12} className="text-noble-gray" />
                                                    <p className="text-xs font-bold text-white">{item.bankName}</p>
                                                </div>
                                                <p className="text-[10px] text-noble-gray font-mono">{item.accountNumber}</p>
                                                <p className="text-[8px] text-primary uppercase font-black tracking-widest">{item.accountName}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col items-center gap-2">
                                                {item.isPriority ? (
                                                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-[0.2em] border border-amber-500/20">Priority ⚡</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded bg-white/5 text-noble-gray text-[8px] font-black uppercase tracking-[0.2em] border border-white/5">Standard</span>
                                                )}
                                                <div className="flex items-center gap-1 text-[8px] text-emerald-500 uppercase font-black">
                                                    <ShieldCheck size={8} /> KYC Verified
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleAction(item.id, 'SUCCESS')}
                                                    className="w-10 h-10 rounded-xl bg-white/5 text-primary border border-white/5 hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center justify-center shadow-lg"
                                                    title="Approve Payout"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(item.id, 'FAILED')}
                                                    className="w-10 h-10 rounded-xl bg-white/5 text-red-500 border border-white/5 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center shadow-lg"
                                                    title="Reject Request"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {approvalList.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center text-noble-gray italic">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Banknote size={48} />
                                            <p className="text-xl font-heading">No pending fiscal obligations found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminApprovals;
