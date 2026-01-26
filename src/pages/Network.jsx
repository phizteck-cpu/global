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
                setReferrals(refRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Failed to fetch network data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-noble-gray">Loading Network...</div>;

    const referralLink = `${window.location.origin}/signup?ref=${user?.referralCode || 'CODE'}`;

    return (
        <div className="font-sans space-y-8 text-white">
            <h2 className="text-3xl font-bold font-heading">My Network</h2>
            <p className="text-noble-gray">Build your community and earn rewards for every active member you refer.</p>

            {/* Referrer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatBox title="Total Members" value={stats?.totalReferrals || 0} icon="👥" />
                <StatBox title="Pending" value={stats?.pendingReferrals || 0} icon="⏳" color="text-amber-500" />
                <StatBox title="Active (Paid)" value={stats?.paidReferrals || 0} icon="✅" color="text-primary" />
                <StatBox title="Total Rewards" value={`₦${(stats?.totalBonusEarned || 0).toLocaleString()}`} icon="🎁" />
            </div>

            {/* Referral Table */}
            <div className="bg-surfaceHighlight rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold">Referral History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-black/20 uppercase text-xs tracking-wider text-noble-gray">
                            <tr>
                                <th className="px-6 py-4">Member Name</th>
                                <th className="px-6 py-4">Signed Up</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Potential Bonus</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {referrals.map((ref) => (
                                <tr key={ref.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{ref.refereeUser.firstName} {ref.refereeUser.lastName}</div>
                                        <div className="text-xs text-noble-gray">{ref.refereeUser.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-noble-gray">
                                        {new Date(ref.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${ref.status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {ref.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-primary">
                                        ₦500.00
                                    </td>
                                </tr>
                            ))}
                            {referrals.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-noble-gray italic">
                                        No referrals yet. Spread the word to start earning!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Referral Link Tool */}
            <div className="bg-gradient-to-br from-primary/20 to-transparent p-8 rounded-3xl border border-primary/20">
                <h3 className="text-xl font-bold mb-2">Invite Others</h3>
                <p className="text-noble-gray text-sm mb-6">Earn ₦500 bonus for every friend who completes their first contribution.</p>
                <div className="flex gap-4">
                    <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="flex-1 p-3 bg-black/40 rounded-xl border border-white/10 text-primary font-bold font-mono"
                    />
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(referralLink);
                            alert('Referral Link Copied!');
                        }}
                        className="px-6 py-3 bg-primary text-background font-bold rounded-xl active:scale-95 transition-transform"
                    >
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ title, value, icon, color = 'text-white' }) => (
    <div className="bg-surfaceHighlight p-6 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">{icon}</span>
            <span className="text-xs text-noble-gray font-bold uppercase tracking-widest">{title}</span>
        </div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
);

export default Network;
