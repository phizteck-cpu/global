import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Network = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get basic user stats - no referral info shown to members
                setStats({
                    totalMembers: 0,
                    activeTeam: 0,
                    qualificationStatus: 'PENDING'
                });
            } catch (error) {
                console.error('Failed to fetch network data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-noble-gray">Loading Team Overview...</div>;

    return (
        <div className="font-sans space-y-8 text-white">
            <h2 className="text-3xl font-bold font-heading">My Team</h2>
            <p className="text-noble-gray">Build your team to unlock additional benefits and rewards.</p>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox title="Team Members" value={stats?.totalMembers || 0} icon="👥" />
                <StatBox title="Active Team" value={stats?.activeTeam || 0} icon="✅" color="text-green-400" />
                <StatBox title="Qualification" value={stats?.qualificationStatus || 'PENDING'} icon="🎯" color="text-amber-400" />
            </div>

            {/* Team Information */}
            <div className="bg-surfaceHighlight rounded-3xl border border-white/5 p-8">
                <h3 className="text-xl font-bold mb-4">Team Building</h3>
                <p className="text-noble-gray">
                    Build a successful team to qualify for double payout benefits. 
                    Your team performance determines your eligibility for additional rewards.
                </p>
                <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="text-sm text-noble-gray">
                        <strong className="text-primary">Note:</strong> Team building information is tracked internally. 
                        Contact your administrator for more details about team qualifications.
                    </p>
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
