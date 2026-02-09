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

    // Withdrawal Details
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [isPriority, setIsPriority] = useState(false);
    const [pin, setPin] = useState('');

    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axiosClient.get('/wallet');
                setBalances({
                    walletBalance: res.data.balance,
                    contributionBalance: res.data.lockedBalance
                });
            } catch (error) {
                console.error('Failed to fetch wallet data');
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        setLoading(true);
        try {
            if (action === 'withdraw') {
                await axiosClient.post('/wallet/withdraw', {
                    amount: parseFloat(amount),
                    bankName,
                    accountNumber,
                    accountName,
                    isPriority,
                    pin
                });
                setMsg('Withdrawal request submitted successfully.');
                setAmount('');
            } else {
                const res = await axiosClient.post('/wallet/fund', { amount: parseFloat(amount) });
                setMsg(`Payment link generated! Please complete payment at: ${res.data.payment_url}`);
                window.open(res.data.payment_url, '_blank');
                setAmount('');
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
                                    <input type="text" required placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" required placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white" />
                                        <input type="text" required placeholder="Account Name" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white" />
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
                            <div className="bg-background p-6 rounded-xl border border-dashed border-white/10 text-center">
                                <p className="font-bold text-noble-gray">Bank Transfer</p>
                                <p className="font-mono text-xl my-2 select-all text-white">1010101010</p>
                                <p className="text-sm text-noble-gray">Zenith Bank • ValueHills Coop</p>
                                <p className="text-xs text-amber-500/80 mt-4">⚠️ Use your Name as reference</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50 ${action === 'deposit' ? 'bg-primary hover:bg-primary-dark shadow-glow' : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600'}`}>
                            {loading ? 'Processing...' : (action === 'deposit' ? 'I Have Paid' : (isPriority ? 'Request Priority Payout' : 'Request Standard Payout'))}
                        </button>
                    </form>
                </div>
            </div>
        </div >
    );
};

export default Wallet;
