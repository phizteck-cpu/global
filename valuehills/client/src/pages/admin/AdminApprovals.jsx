import React, { useState, useEffect } from 'react';
import axiosClient from '../../axiosClient';
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    ShieldCheck,
    CreditCard,
    AlertCircle,
    Terminal,
    Users,
    DollarSign,
    RefreshCw,
    FileText,
    Image
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminApprovals = () => {
    const [activeTab, setActiveTab] = useState('registrations');
    const [pendingRegistrations, setPendingRegistrations] = useState([]);
    const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
    const [pendingPaymentProofs, setPendingPaymentProofs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [selectedProof, setSelectedProof] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [regRes, withRes, proofRes] = await Promise.all([
                axiosClient.get('/admin/pending-registrations'),
                axiosClient.get('/admin/pending-withdrawals'),
                axiosClient.get('/admin/payment-proofs?status=PENDING')
            ]);
            setPendingRegistrations(regRes.data);
            setPendingWithdrawals(withRes.data);
            setPendingPaymentProofs(proofRes.data);
        } catch (error) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveRegistration = async (id) => {
        try {
            await axiosClient.post(`/admin/registrations/${id}/approve`);
            setMsg({ type: 'success', text: 'Registration approved successfully!' });
            setPendingRegistrations(prev => prev.filter(r => r.id !== id));
            setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Failed to approve' });
        }
    };

    const handleRejectRegistration = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await axiosClient.post(`/admin/registrations/${id}/reject`, { reason });
            setMsg({ type: 'success', text: 'Registration rejected' });
            setPendingRegistrations(prev => prev.filter(r => r.id !== id));
            setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Failed to reject' });
        }
    };

    const handleApproveWithdrawal = async (id) => {
        if (!window.confirm('Approve this withdrawal?')) return;
        try {
            await axiosClient.post(`/admin/withdrawals/${id}/approve`);
            setMsg({ type: 'success', text: 'Withdrawal approved successfully!' });
            setPendingWithdrawals(prev => prev.filter(w => w.id !== id));
            setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Failed to approve withdrawal' });
        }
    };

    const handleRejectWithdrawal = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await axiosClient.post(`/admin/withdrawals/${id}/reject`, { reason });
            setMsg({ type: 'success', text: 'Withdrawal rejected' });
            setPendingWithdrawals(prev => prev.filter(w => w.id !== id));
            setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Failed to reject withdrawal' });
        }
    };

    const handleProcessWithdrawal = async (id) => {
        if (!window.confirm('Mark as processed/completed?')) return;
        try {
            await axiosClient.post(`/admin/withdrawals/${id}/process`);
            setMsg({ type: 'success', text: 'Withdrawal marked as completed!' });
            setPendingWithdrawals(prev => prev.filter(w => w.id !== id));
            setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Failed to process' });
        }
    };

    const handleApprovePaymentProof = async (id) => {
        const adminNote = prompt('Enter approval note (optional):');
        try {
            await axiosClient.post(`/admin/payment-proofs/${id}/approve`, { adminNote: adminNote || '' });
            setMsg({ type: 'success', text: 'Payment proof approved! User account activated.' });
            setPendingPaymentProofs(prev => prev.filter(p => p.id !== id));
            setSelectedProof(null);
            setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Failed to approve' });
        }
    };

    const handleRejectPaymentProof = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        try {
            await axiosClient.post(`/admin/payment-proofs/${id}/reject`, { adminNote: reason });
            setMsg({ type: 'success', text: 'Payment proof rejected' });
            setPendingPaymentProofs(prev => prev.filter(p => p.id !== id));
            setSelectedProof(null);
            setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.error || 'Failed to reject' });
        }
    };

    if (loading && pendingRegistrations.length === 0 && pendingWithdrawals.length === 0 && pendingPaymentProofs.length === 0) {
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
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <Terminal size={18} />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Approvals Terminal</span>
                    </div>
                    <h2 className="text-5xl font-black font-heading text-white tracking-tighter leading-none">Approval Center</h2>
                    <p className="text-slate-400 italic font-light max-w-md">Manage registrations and withdrawals</p>
                </div>
                <div className="relative z-10 flex gap-4">
                    <button 
                        onClick={fetchData}
                        className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-amber-500/50 transition-colors"
                    >
                        <RefreshCw size={20} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 flex-wrap">
                <button
                    onClick={() => setActiveTab('registrations')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                        activeTab === 'registrations' 
                            ? 'bg-amber-500 text-slate-900' 
                            : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                >
                    <Users size={20} />
                    Registrations
                    {pendingRegistrations.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {pendingRegistrations.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('paymentProofs')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                        activeTab === 'paymentProofs' 
                            ? 'bg-amber-500 text-slate-900' 
                            : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                >
                    <FileText size={20} />
                    Payment Proofs
                    {pendingPaymentProofs.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {pendingPaymentProofs.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('withdrawals')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                        activeTab === 'withdrawals' 
                            ? 'bg-amber-500 text-slate-900' 
                            : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                >
                    <DollarSign size={20} />
                    Withdrawals
                    {pendingWithdrawals.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                            {pendingWithdrawals.length}
                        </span>
                    )}
                </button>
            </div>

            {msg.text && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 font-bold text-sm ${
                    msg.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}>
                    <AlertCircle size={18} />
                    {msg.text}
                </div>
            )}

            {/* Registrations Tab */}
            {activeTab === 'registrations' && (
                <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-premium">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr className="text-slate-400">
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">User</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Tier</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Referred By</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">KYC</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Date</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pendingRegistrations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center text-slate-500">
                                            No pending registrations
                                        </td>
                                    </tr>
                                ) : (
                                    pendingRegistrations.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center font-bold text-amber-500">
                                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{user.firstName} {user.lastName}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase">{user.username}</p>
                                                        <p className="text-[10px] text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full">
                                                    {user.tier?.name || 'STARTER'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-slate-400">
                                                {user.referredByCode || '-'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded ${
                                                    user.kycStatus === 'VERIFIED' 
                                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                                        : 'bg-yellow-500/10 text-yellow-500'
                                                }`}>
                                                    {user.kycStatus || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-slate-400">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApproveRegistration(user.id)}
                                                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectRegistration(user.id)}
                                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payment Proofs Tab */}
            {activeTab === 'paymentProofs' && (
                <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-premium">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr className="text-slate-400">
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">User</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Type</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Amount</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Proof Image</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Date</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pendingPaymentProofs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-12 text-center text-slate-500">
                                            No pending payment proofs
                                        </td>
                                    </tr>
                                ) : (
                                    pendingPaymentProofs.map((proof) => (
                                        <motion.tr
                                            key={proof.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-500">
                                                        {proof.user?.firstName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{proof.user?.firstName} {proof.user?.lastName}</p>
                                                        <p className="text-[10px] text-slate-500 uppercase">{proof.user?.username}</p>
                                                        <p className="text-[10px] text-slate-500">{proof.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                    proof.amount === 3000 
                                                        ? 'bg-amber-500/10 text-amber-500' 
                                                        : 'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                    {proof.amount === 3000 ? 'ACTIVATION' : 'WALLET FUNDING'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-2xl font-black text-white">₦{proof.amount?.toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <button
                                                    onClick={() => setSelectedProof(proof)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                                                >
                                                    <Image size={16} />
                                                    <span className="text-xs font-bold">View Proof</span>
                                                </button>
                                            </td>
                                            <td className="px-8 py-6 text-slate-400">
                                                {new Date(proof.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApprovePaymentProof(proof.id)}
                                                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectPaymentProof(proof.id)}
                                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Proof Image Modal */}
            <AnimatePresence>
                {selectedProof && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedProof(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-white">Payment Proof</h3>
                                <button
                                    onClick={() => setSelectedProof(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg"
                                >
                                    <XCircle size={24} className="text-slate-400" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-500">
                                        {selectedProof.user?.firstName?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{selectedProof.user?.firstName} {selectedProof.user?.lastName}</p>
                                        <p className="text-sm text-slate-400">{selectedProof.user?.username} • ₦{selectedProof.amount?.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="border border-white/10 rounded-2xl overflow-hidden">
                                    <img 
                                        src={selectedProof.proofImageUrl} 
                                        alt="Payment Proof" 
                                        className="w-full h-auto max-h-[400px] object-contain bg-black"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.png';
                                        }}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleApprovePaymentProof(selectedProof.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
                                    >
                                        <CheckCircle size={20} />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleRejectPaymentProof(selectedProof.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                                    >
                                        <XCircle size={20} />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Withdrawals Tab */}
            {activeTab === 'withdrawals' && (
                <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-premium">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr className="text-slate-400">
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">User</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Amount</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Bank Details</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Date</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pendingWithdrawals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                                            No pending withdrawals
                                        </td>
                                    </tr>
                                ) : (
                                    pendingWithdrawals.map((withdrawal) => (
                                        <motion.tr
                                            key={withdrawal.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center font-bold text-blue-500">
                                                        {withdrawal.user?.firstName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">
                                                            {withdrawal.user?.firstName} {withdrawal.user?.lastName}
                                                        </p>
                                                        <p className="text-[10px] text-slate-500 uppercase">{withdrawal.user?.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-2xl font-black text-white">₦{withdrawal.amount?.toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard size={12} className="text-slate-500" />
                                                        <p className="text-xs font-bold text-white">{withdrawal.bankName}</p>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-mono">{withdrawal.accountNumber}</p>
                                                    <p className="text-[10px] text-amber-500 uppercase font-bold">{withdrawal.accountName}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-slate-400">
                                                {new Date(withdrawal.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleApproveWithdrawal(withdrawal.id)}
                                                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleProcessWithdrawal(withdrawal.id)}
                                                        className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
                                                        title="Mark as Processed"
                                                    >
                                                        <Clock size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectWithdrawal(withdrawal.id)}
                                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminApprovals;
