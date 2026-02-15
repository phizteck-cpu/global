import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
    const { user: _user } = useAuth();
    const navigate = useNavigate();
    const [action, setAction] = useState('deposit');
    const [amount, setAmount] = useState('');
    const [balances, setBalances] = useState({ walletBalance: 0, contributionBalance: 0, bvBalance: 0 });
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [pin, setPin] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/wallet');
                setBalances({
                    walletBalance: res.data.balance || 0,
                    contributionBalance: res.data.lockedBalance || 0,
                    bvBalance: res.data.bvBalance || 0
                });
            } catch (error) {
                console.error('Failed to fetch wallet');
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');

        try {
            if (action === 'deposit') {
                const res = await api.post('/wallet/fund', { amount: parseFloat(amount) });
                setMsg(res.data.message || 'Wallet funded successfully');
            } else {
                const res = await api.post('/wallet/withdraw', { 
                    amount: parseFloat(amount), 
                    bankName, 
                    accountNumber, 
                    accountName, 
                    pin 
                });
                setMsg(res.data.message || 'Withdrawal requested successfully');
            }
            const res = await api.get('/wallet');
            setBalances({
                walletBalance: res.data.balance || 0,
                contributionBalance: res.data.lockedBalance || 0,
                bvBalance: res.data.bvBalance || 0
            });
            setAmount('');
        } catch (error) {
            setMsg(error.response?.data?.message || error.response?.data?.error || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ color: 'white' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>Wallet</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Manage your funds and transactions.</p>

            {msg && (
                <div style={{ padding: '15px', background: msg.includes('success') || msg.includes('successfully') ? 'rgba(34,211,238,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('success') || msg.includes('successfully') ? 'rgba(34,211,238,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '10px', marginBottom: '20px', color: msg.includes('success') || msg.includes('successfully') ? '#22d3ee' : '#f87171' }}>
                    {msg}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: 'rgba(30,41,59,0.8)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Available Balance</p>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#22d3ee' }}>₦{balances.walletBalance?.toLocaleString()}</h3>
                </div>
                <div style={{ background: 'rgba(30,41,59,0.8)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Locked Contribution</p>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#f97316' }}>₦{balances.contributionBalance?.toLocaleString()}</h3>
                </div>
                <div style={{ background: 'rgba(30,41,59,0.8)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>BV Points</p>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#34d399' }}>{balances.bvBalance}</h3>
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                    <button
                        onClick={() => setAction('deposit')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: action === 'deposit' ? '#22d3ee' : 'rgba(255,255,255,0.1)',
                            color: action === 'deposit' ? '#0f172a' : '#94a3b8',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Deposit
                    </button>
                    <button
                        onClick={() => setAction('withdraw')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: action === 'withdraw' ? '#f97316' : 'rgba(255,255,255,0.1)',
                            color: action === 'withdraw' ? '#0f172a' : '#94a3b8',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Withdraw
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Amount (₦)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            min="100"
                            style={{
                                width: '100%',
                                padding: '15px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                            placeholder="Enter amount"
                        />
                    </div>

                    {action === 'withdraw' && (
                        <>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Bank Name</label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="e.g., Zenith Bank"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Account Number</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    required
                                    maxLength="10"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="10-digit account number"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Account Name</label>
                                <input
                                    type="text"
                                    value={accountName}
                                    onChange={(e) => setAccountName(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="Account holder name"
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Transaction PIN</label>
                                <input
                                    type="password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    required
                                    maxLength="6"
                                    style={{
                                        width: '100%',
                                        padding: '15px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                    placeholder="4-6 digit PIN"
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '15px',
                            borderRadius: '10px',
                            border: 'none',
                            background: action === 'deposit' ? '#22d3ee' : '#f97316',
                            color: '#0f172a',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Processing...' : action === 'deposit' ? 'Fund Wallet' : 'Request Withdrawal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Wallet;
