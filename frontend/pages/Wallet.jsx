import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [action, setAction] = useState('deposit'); // deposit | withdraw
    const [amount, setAmount] = useState('');
    const [balances, setBalances] = useState({ walletBalance: 0, contributionBalance: 0 });

    // Deposit/Payment Proof Details
    const [proofImage, setProofImage] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [bankName, setBankName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [transactionRef, setTransactionRef] = useState('');

    // Withdrawal Details
    const [withdrawBankName, setWithdrawBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [withdrawAccountName, setWithdrawAccountName] = useState('');
    const [isPriority, setIsPriority] = useState(false);
    const [pin, setPin] = useState('');

    // Payment proof history
    const [paymentProofs, setPaymentProofs] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Company account details
    const [companyAccount, setCompanyAccount] = useState({
        bankName: 'Loading...',
        accountNumber: '...',
        accountName: 'Loading...'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosClient.get('/wallet');
                setBalances({
                    walletBalance: res.data.balance,
                    contributionBalance: res.data.lockedBalance
                });

                // Fetch payment proof history
                const proofsRes = await axiosClient.get('/wallet/payment-proofs');
                setPaymentProofs(proofsRes.data);

                // Fetch company account details
                const accountRes = await axiosClient.get('/wallet/company-account');
                setCompanyAccount(accountRes.data);
            } catch (error) {
                console.error('Failed to fetch wallet data');
            }
        };
        fetchData();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofImage(file);
            setProofPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setLoading(true);
        try {
            if (action === 'withdraw') {
                await axiosClient.post('/wallet/withdraw', {
                    amount: parseFloat(amount),
                    bankName: withdrawBankName,
                    accountNumber,
                    accountName: withdrawAccountName,
                    isPriority,
                    pin
                });
                setMsg('Withdrawal request submitted successfully.');
                setAmount('');
                // Refresh balances
                const res = await axiosClient.get('/wallet');
                setBalances({
                    walletBalance: res.data.balance,
                    contributionBalance: res.data.lockedBalance
                });
            } else {
                // Upload payment proof
                if (!proofImage) {
                    setMsg('Please upload payment proof image');
                    setLoading(false);
                    return;
                }

                const formData = new FormData();
                formData.append('amount', parseFloat(amount));
                formData.append('proofImage', proofImage);
                formData.append('bankName', bankName);
                formData.append('accountName', accountName);
                formData.append('transactionRef', transactionRef);

                const res = await axiosClient.post('/wallet/fund', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                setMsg(`✅ ${res.data.message}`);
                setAmount('');
                setProofImage(null);
                setProofPreview(null);
                setBankName('');
                setAccountName('');
                setTransactionRef('');

                // Refresh payment proofs
                const proofsRes = await axiosClient.get('/wallet/payment-proofs');
                setPaymentProofs(proofsRes.data);
            }
        } catch (error) {
            setMsg(error.response?.data?.error || 'Operation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans space-y-8 text-white">
            <h2 className="text-3xl font-bold font-heading">My Wallet</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                {/* Virtual Wallet */}
                <div className="bg-surfaceHighlight p-8 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <p className="text-noble-gray uppercase tracking-widest text-xs mb-2">Virtual Wallet (Fees)</p>
                        <h3 className="text-3xl font-bold font-heading">₦{balances.walletBalance?.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Contribution Balance */}
                <div className="glass-card p-8 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50 text-4xl grayscale">⚓</div>
                    <div className="relative z-10">
                        <p className="text-noble-gray uppercase tracking-widest text-xs mb-2">Cooperative Assets</p>
                        <h3 className="text-3xl font-bold font-heading text-primary">₦{balances.contributionBalance?.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl">
                <div className="flex bg-surfaceHighlight p-1 rounded-2xl border border-white/5 mb-8">
                    <button
                        onClick={() => setAction('deposit')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${action === 'deposit' ? 'bg-primary text-background shadow-glow' : 'text-noble-gray hover:text-white'}`}
                    >
                        Fund Wallet
                    </button>
                    <button
                        onClick={() => setAction('withdraw')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${action === 'withdraw' ? 'bg-red-600 text-white shadow-lg' : 'text-noble-gray hover:text-white'}`}
                    >
                        Withdraw Assets
                    </button>
                </div>

                <div className="bg-surfaceHighlight rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                    {msg && <div className={`p-4 mb-6 rounded-xl text-sm border ${msg.includes('success') || msg.includes('sent') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{msg}</div>}

                    <h3 className="text-xl font-bold font-heading mb-6">{action === 'deposit' ? 'Add Funds' : 'Request Payout'}</h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-noble-gray mb-2">Amount (₦)</label>
                            <input
                                type="number"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-4 bg-background rounded-xl border border-white/10 focus:outline-none focus:border-primary/50 text-white font-bold text-lg"
                                placeholder="0.00"
                            />
                        </div>

                        {action === 'withdraw' && (
                            <>
                                <div className="space-y-4">
                                    <input type="text" required placeholder="Bank Name" value={withdrawBankName} onChange={(e) => setWithdrawBankName(e.target.value)} className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" required placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white" />
                                        <input type="text" required placeholder="Account Name" value={withdrawAccountName} onChange={(e) => setWithdrawAccountName(e.target.value)} className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white" />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl border border-white/10 bg-background flex items-center justify-between cursor-pointer hover:border-amber-500/30 transition-colors" onClick={() => setIsPriority(!isPriority)}>
                                    <div>
                                        <h4 className="font-bold text-amber-500">Priority Processing ⚡</h4>
                                        <p className="text-xs text-noble-gray">Get funds in 24hrs. 10% Service Fee applies.</p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${isPriority ? 'bg-amber-500 border-amber-500' : 'border-noble-gray'}`}>
                                        {isPriority && <span className="text-black text-xs">✓</span>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-noble-gray mb-2">Security PIN</label>
                                    <input
                                        type="password"
                                        required
                                        maxLength={6}
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        className="w-full p-4 bg-background rounded-xl border border-white/10 focus:border-secondary/50 text-white font-mono tracking-widest text-center text-lg"
                                        placeholder="••••••"
                                    />
                                    <p className="text-[10px] text-center text-noble-gray">Enter your 4-6 digit transaction PIN</p>
                                </div>
                            </>
                        )}

                        {action === 'deposit' && (
                            <>
                                <div className="bg-background p-6 rounded-xl border border-dashed border-white/10 text-center">
                                    <p className="font-bold text-noble-gray">Bank Transfer Details</p>
                                    <p className="font-mono text-xl my-2 select-all text-white">{companyAccount.accountNumber}</p>
                                    <p className="text-sm text-noble-gray">{companyAccount.bankName} • {companyAccount.accountName}</p>
                                    <p className="text-xs text-amber-500/80 mt-4">⚠️ Use your Name as reference</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-noble-gray mb-2">Upload Payment Proof *</label>
                                        <input
                                            type="file"
                                            required
                                            accept="image/*,.pdf"
                                            onChange={handleFileChange}
                                            className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:cursor-pointer"
                                        />
                                        <p className="text-xs text-noble-gray mt-1">Upload screenshot or receipt (JPG, PNG, PDF - Max 5MB)</p>
                                    </div>

                                    {proofPreview && (
                                        <div className="relative">
                                            <img src={proofPreview} alt="Payment Proof Preview" className="w-full h-48 object-cover rounded-xl border border-white/10" />
                                            <button
                                                type="button"
                                                onClick={() => { setProofImage(null); setProofPreview(null); }}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}

                                    <input
                                        type="text"
                                        placeholder="Bank Name (Optional)"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Account Name (Optional)"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Transaction Reference (Optional)"
                                        value={transactionRef}
                                        onChange={(e) => setTransactionRef(e.target.value)}
                                        className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white"
                                    />
                                </div>

                                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                                    <p className="text-amber-500 font-bold text-sm">📋 Manual Approval Process</p>
                                    <p className="text-xs text-noble-gray mt-1">Your payment will be reviewed by admin. Approval typically takes 1-24 hours.</p>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 ${action === 'deposit' ? 'bg-primary hover:bg-primary-dark shadow-glow' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600'}`}>
                            {loading ? 'Processing...' : (action === 'deposit' ? 'Submit Payment Proof' : (isPriority ? 'Request Priority Payout' : 'Request Standard Payout'))}
                        </button>
                    </form>
                </div>

                {/* Payment Proof History */}
                {paymentProofs.length > 0 && (
                    <div className="mt-8">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full py-3 bg-surfaceHighlight rounded-xl border border-white/5 text-white font-bold hover:bg-white/5 transition-colors flex items-center justify-between px-6"
                        >
                            <span>Payment History ({paymentProofs.length})</span>
                            <span>{showHistory ? '▼' : '▶'}</span>
                        </button>

                        {showHistory && (
                            <div className="mt-4 space-y-3">
                                {paymentProofs.map((proof) => (
                                    <div key={proof.id} className="bg-surfaceHighlight p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-white font-bold">₦{proof.amount.toLocaleString()}</p>
                                                <p className="text-xs text-noble-gray">{new Date(proof.createdAt).toLocaleString()}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                proof.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                                proof.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {proof.status}
                                            </span>
                                        </div>
                                        {proof.transactionRef && (
                                            <p className="text-xs text-noble-gray">Ref: {proof.transactionRef}</p>
                                        )}
                                        {proof.adminNote && (
                                            <p className="text-xs text-noble-gray mt-2 italic">Admin: {proof.adminNote}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
};

export default Wallet;
