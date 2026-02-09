import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';

const Packages = () => {
    const navigate = useNavigate();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const res = await axiosClient.get('/packages');
                setTiers(res.data);
            } catch (error) {
                console.error('Failed to fetch tiers');
            } finally {
                setLoading(false);
            }
        };

        fetchTiers();
    }, []);

    const handleUpgrade = async (tier) => {
        if (!window.confirm(`Are you sure you want to upgrade to ${tier.name}? Upgrade Fee: ₦${tier.upgradeFee.toLocaleString()}`)) return;

        try {
            await axiosClient.post(`/packages/upgrade/${tier.id}`);
            alert('Upgrade successful! Your tier and contribution limits have been updated.');
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to upgrade. Ensure you have sufficient funds in your Virtual Wallet.');
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading Tiers...</div>;

    return (
        <div className="font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-slate-900">Membership Tiers</h2>
                    <p className="text-slate-500 mt-1">Select a tier that matches your contribution capacity.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiers.map(tier => (
                    <div key={tier.id} className="glass-card bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 px-4 py-2 text-xs font-bold rounded-bl-2xl text-white bg-slate-800`}>
                            TIER {tier.id}
                        </div>

                        <h3 className="text-2xl font-bold font-heading text-slate-900 mb-2">{tier.name}</h3>
                        <p className="text-slate-500 mb-6 text-sm leading-relaxed">Weekly Contribution Target</p>

                        <div className="space-y-4 mb-8 flex-1">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-slate-500 text-sm">Contribution</span>
                                <span className="font-bold text-slate-900">₦{tier.weeklyAmount?.toLocaleString()}<span className="text-xs font-normal text-slate-400">/week</span></span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-slate-500 text-sm">Upgrade Fee</span>
                                <span className="font-bold text-slate-900">₦{tier.upgradeFee?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-sm">Cycle</span>
                                <span className="font-bold text-emerald-600">45 Weeks</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleUpgrade(tier)}
                            className="w-full py-4 rounded-xl font-bold text-white bg-slate-900 group-hover:bg-brand-green transition-colors shadow-lg"
                        >
                            Upgrade to {tier.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Packages;
