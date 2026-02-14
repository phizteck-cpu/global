import React, { useEffect, useState } from 'react';
import axiosClient from '../../axiosClient';
import { CheckCircle, XCircle, Clock, Eye, Download } from 'lucide-react';

const AdminPayments = () => {
    const [proofs, setProofs] = useState([]);
    const [filter, setFilter] = useState('PENDING');
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchProofs();
    }, [filter]);

    const fetchProofs = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/admin/payment-proofs?status=${filter}`);
            setProofs(res.data);
        } catch (error) {
            console.error('Failed to fetch payment proofs');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (proofId) => {
        if (!window.confirm('Are you sure you want to approve this payment?')) return;

        try {
            setProcessing(true);
            await axiosClient.post(`/admin/payment-proofs/${proofId}/approve`, {
                adminNote: adminNote || 'Approved'
            });
            alert('Payment approved successfully');
            setSelectedProof(null);
            setAdminNote('');
            fetchProofs();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to approve payment');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (proofId) => {
        if (!adminNote.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        if (!window.confirm('Are you sure you want to reject this payment?')) return;

        try {
            setProcessing(true);
            await axiosClient.post(`/admin/payment-proofs/${proofId}/reject`, {
                adminNote
            });
            alert('Payment rejected');
            setSelectedProof(null);
            setAdminNote('');
            fetchProofs();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to reject payment');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'text-green-400 bg-green-500/20';
            case 'REJECTED': return 'text-red-400 bg-red-500/20';
            default: return 'text-amber-400 bg-amber-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold font-heading text-white">Payment Approvals</h2>
                <div className="flex gap-2">
                    {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                                filter === status
                                    ? 'bg-primary text-white'
                                    : 'bg-surfaceHighlight text-noble-gray hover:text-white'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : proofs.length === 0 ? (
                <div className="text-center py-12 bg-surfaceHighlight rounded-3xl border border-white/5">
                    <Clock size={48} className="mx-auto text-noble-gray mb-4" />
                    <p className="text-noble-gray">No {filter.toLowerCase()} payment proofs</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {proofs.map((proof) => (
                        <div key={proof.id} className="bg-surfaceHighlight rounded-3xl p-6 border border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">₦{proof.amount.toLocaleString()}</h3>
                                    <p className="text-sm text-noble-gray">
                                        {proof.user.firstName} {proof.user.lastName} (@{proof.user.username})
                                    </p>
                                    <p className="text-xs text-noble-gray">{proof.user.email}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(proof.status)}`}>
                                    {proof.status}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4 text-sm">
                                <p className="text-noble-gray">
                                    <span className="text-white font-bold">Date:</span> {new Date(proof.createdAt).toLocaleString()}
                                </p>
                                {proof.bankName && (
                                    <p className="text-noble-gray">
                                        <span className="text-white font-bold">Bank:</span> {proof.bankName}
                                    </p>
                                )}
                                {proof.accountName && (
                                    <p className="text-noble-gray">
                                        <span className="text-white font-bold">Account:</span> {proof.accountName}
                                    </p>
                                )}
                                {proof.transactionRef && (
                                    <p className="text-noble-gray">
                                        <span className="text-white font-bold">Ref:</span> {proof.transactionRef}
                                    </p>
                                )}
                            </div>

                            <div className="mb-4">
                                <img
                                    src={`http://localhost:5000/${proof.proofImageUrl}`}
                                    alt="Payment Proof"
                                    className="w-full h-48 object-cover rounded-xl border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => window.open(`http://localhost:5000/${proof.proofImageUrl}`, '_blank')}
                                />
                            </div>

                            {proof.status === 'PENDING' && (
                                <div className="space-y-3">
                                    <textarea
                                        placeholder="Admin note (optional for approval, required for rejection)"
                                        value={selectedProof === proof.id ? adminNote : ''}
                                        onChange={(e) => {
                                            setSelectedProof(proof.id);
                                            setAdminNote(e.target.value);
                                        }}
                                        className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white text-sm"
                                        rows="2"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleApprove(proof.id)}
                                            disabled={processing}
                                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <CheckCircle size={18} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(proof.id)}
                                            disabled={processing}
                                            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <XCircle size={18} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )}

                            {proof.adminNote && (
                                <div className="mt-4 p-3 bg-background rounded-xl border border-white/10">
                                    <p className="text-xs text-noble-gray font-bold mb-1">Admin Note:</p>
                                    <p className="text-sm text-white">{proof.adminNote}</p>
                                    {proof.processedAt && (
                                        <p className="text-xs text-noble-gray mt-1">
                                            Processed: {new Date(proof.processedAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
