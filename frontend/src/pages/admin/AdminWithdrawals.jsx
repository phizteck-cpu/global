import React, { useState, useEffect } from 'react';
import api from '../../api';

const AdminWithdrawals = () => {
    const [withdrawalList, setWithdrawalList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWithdrawals = async () => {
            try {
                const res = await api.get('/admin/approvals');
                setWithdrawalList(res.data);
            } catch (error) {
                console.error('Failed to fetch withdrawals');
            } finally {
                setLoading(false);
            }
        };
        fetchWithdrawals();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this payout? Fee will be deducted and User debited.')) return;
        try {
            await api.post(`/withdrawals/approve/${id}`);
            setWithdrawalList(prev => prev.filter(i => i.id !== id));
            alert('Withdrawal Approved successfully.');
        } catch (error) {
            alert(error.response?.data?.error || 'Approval failed');
        }
    };

    if (loading) return <div className="p-10 text-center text-noble-gray">Loading requests...</div>;

    return (
        <div className="space-y-6 text-white">
            <h2 className="text-2xl font-bold font-heading">Withdrawal Requests</h2>
            <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
                <div className="divide-y divide-white/10 bg-white/5">
                    {withdrawalList.length === 0 ? (
                        <p className="p-8 text-noble-gray text-center">No pending withdrawals</p>
                    ) : (
                        withdrawalList.map(w => (
                            <div key={w.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-white/[0.03] transition-colors">
                                <div>
                                    <h4 className="font-bold text-2xl text-white mb-1">?{w.amount.toLocaleString()}</h4>
                                    <div className="flex flex-col text-sm text-noble-gray">
                                        <span>{w.bankName} - {w.accountNumber}</span>
                                        <span className="text-white uppercase text-xs font-bold tracking-wider">{w.accountName}</span>
                                    </div>
                                    <p className="text-xs text-noble-gray mt-2">Requested by {w.user.firstName} {w.user.lastName}</p>
                                </div>
                                <button onClick={() => handleApprove(w.id)} className="w-full md:w-auto bg-secondary hover:bg-orange-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-orange-900/20 transition-all">
                                    Approve Payout
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminWithdrawals;
