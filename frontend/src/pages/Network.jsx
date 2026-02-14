import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Network = () => {
    const { user } = useAuth();
    const [referrals, setReferrals] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [refRes, statsRes] = await Promise.all([
                    api.get('/referrals'),
                    api.get('/referrals/stats')
                ]);
                setReferrals(refRes.data || []);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Failed to fetch network data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                Loading Network...
            </div>
        );
    }

    const referralLink = `${window.location.origin}/signup?ref=${user?.referralCode || 'CODE'}`;

    return (
        <div style={{ color: 'white' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>My Network</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Build your community and earn rewards for every active member you refer.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                <div style={{ background: 'rgba(30,41,59,0.8)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Total Referrals</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>{stats?.totalReferrals || 0}</h3>
                </div>
                <div style={{ background: 'rgba(30,41,59,0.8)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Pending</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#f97316' }}>{stats?.pendingReferrals || 0}</h3>
                </div>
                <div style={{ background: 'rgba(30,41,59,0.8)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Active</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#22d3ee' }}>{stats?.activeReferrals || 0}</h3>
                </div>
                <div style={{ background: 'rgba(30,41,59,0.8)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Total Earned</p>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#34d399' }}>₦{stats?.totalBonusEarned?.toLocaleString() || 0}</h3>
                </div>
            </div>

            <div style={{ background: 'rgba(30,41,59,0.8)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>Your Referral Link</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={referralLink}
                        readOnly
                        style={{
                            flex: 1,
                            padding: '12px 15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.3)',
                            color: '#94a3b8',
                            fontSize: '0.9rem'
                        }}
                    />
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(referralLink);
                            alert('Link copied!');
                        }}
                        style={{
                            padding: '12px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            background: '#22d3ee',
                            color: '#0f172a',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Copy
                    </button>
                </div>
            </div>

            <div style={{ background: 'rgba(30,41,59,0.8)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Referral History</h3>
                </div>
                
                {(!referrals || referrals.length === 0) ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        No referrals yet. Share your link to invite members!
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#94a3b8', fontSize: '0.8rem' }}>Member</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#94a3b8', fontSize: '0.8rem' }}>Joined</th>
                                <th style={{ padding: '15px', textAlign: 'left', color: '#94a3b8', fontSize: '0.8rem' }}>Status</th>
                                <th style={{ padding: '15px', textAlign: 'right', color: '#94a3b8', fontSize: '0.8rem' }}>Bonus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {referrals.map((ref) => (
                                <tr key={ref.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{ref.referred?.firstName} {ref.referred?.lastName}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{ref.referred?.email}</div>
                                    </td>
                                    <td style={{ padding: '15px', color: '#94a3b8' }}>
                                        {new Date(ref.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ 
                                            padding: '5px 10px', 
                                            borderRadius: '5px', 
                                            fontSize: '0.7rem',
                                            background: ref.status === 'PAID' ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.2)',
                                            color: ref.status === 'PAID' ? '#34d399' : '#f59e0b'
                                        }}>
                                            {ref.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', textAlign: 'right', color: '#22d3ee', fontWeight: 'bold' }}>
                                        ₦500
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Network;
