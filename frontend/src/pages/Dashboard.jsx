import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                if (error.response?.status === 401) logout();
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate, logout]);

    const handlePayContribution = async () => {
        try {
            setLoading(true);
            const res = await api.post('/contributions/pay');
            setMsg(res.data.message);
            const statsRes = await api.get('/dashboard/stats');
            setStats(statsRes.data);
            setTimeout(() => setMsg(''), 5000);
        } catch (error) {
            setMsg(error.response?.data?.error || 'Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', border: '4px solid #22d3ee', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                    <p style={{ color: '#22d3ee', fontWeight: 'bold', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div style={{ paddingBottom: '80px' }}>
            {msg && (
                <div style={{ padding: '15px', background: 'rgba(34, 211, 238, 0.1)', border: '1px solid rgba(34, 211, 238, 0.3)', borderRadius: '10px', color: '#22d3ee', marginBottom: '20px' }}>
                    {msg}
                </div>
            )}

            <div style={{ background: 'linear-gradient(to bottom right, rgba(30,41,59,0.8), #0f172a)', padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'rgba(34, 211, 238, 0.05)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '10px' }}>
                            Welcome, <span style={{ color: '#f97316' }}>{user?.firstName}</span>
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Member ID: {stats.memberId}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Wallet Balance</p>
                        <h3 style={{ fontSize: '2rem', fontWeight: '900', color: 'white' }}>₦{stats.walletBalance?.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Contribution Balance</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#22d3ee' }}>₦{stats.contributionBalance?.toLocaleString()}</h3>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Business Volume</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f59e0b' }}>{stats.bvBalance}</h3>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Tier Status</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: stats.eligibilityStatus === 'ELIGIBLE' ? '#34d399' : '#f87171' }}>{stats.tier}</h3>
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '30px', marginTop: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'white' }}>Active Contribution Cycle</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>45-Week Program</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '2rem', fontWeight: '900', color: 'white' }}>{stats.weeksCompleted}</span>
                        <span style={{ color: '#94a3b8', fontWeight: 'bold', marginLeft: '5px' }}>/ {stats.totalWeeks} Weeks</span>
                    </div>
                </div>

                <div style={{ height: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginBottom: '25px' }}>
                    <div style={{ height: '100%', width: `${(stats.weeksCompleted / stats.totalWeeks) * 100}%`, background: 'linear-gradient(to right, #22d3ee, #34d399)', borderRadius: '10px', transition: 'width 1.5s ease' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '15px' }}>
                        <span style={{ color: '#22d3ee' }}>Week {stats.weeksCompleted + 1}</span>
                    </div>
                    <button
                        onClick={handlePayContribution}
                        disabled={stats.weeksCompleted >= 45 || loading}
                        style={{
                            background: stats.weeksCompleted >= 45 ? 'rgba(255,255,255,0.1)' : '#22d3ee',
                            color: stats.weeksCompleted >= 45 ? '#94a3b8' : '#0f172a',
                            padding: '15px 30px',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: stats.weeksCompleted >= 45 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Processing...' : 'Pay Contribution'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
