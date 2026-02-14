import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Packages = () => {
    const navigate = useNavigate();
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const res = await api.get('/packages');
                console.log('Packages response:', res.data);
                setTiers(res.data.packages || []);
            } catch (error) {
                console.error('Failed to fetch tiers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTiers();
    }, []);

    const handleUpgrade = async (tier) => {
        if (!window.confirm(`Are you sure you want to upgrade to ${tier.name}? Upgrade Fee: ₦${tier.upgradeFee?.toLocaleString()}`)) return;

        try {
            await api.post(`/packages/upgrade/${tier.id}`);
            alert('Upgrade successful! Your tier and contribution limits have been updated.');
            navigate('/dashboard');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to upgrade. Ensure you have sufficient funds in your Virtual Wallet.');
        }
    };

    if (loading) return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Loading Tiers...
        </div>
    );

    if (!tiers || tiers.length === 0) return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            No tiers available
        </div>
    );

    return (
        <div style={{ color: 'white', padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>Membership Tiers</h2>
                <p style={{ color: '#94a3b8' }}>Select a tier that matches your contribution capacity.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {tiers.map(tier => (
                    <div 
                        key={tier.id} 
                        style={{ 
                            background: 'rgba(30, 41, 59, 0.8)', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            borderRadius: '20px', 
                            padding: '30px',
                            position: 'relative'
                        }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px', color: 'white' }}>
                            {tier.name}
                        </h3>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '10px' }}>
                                <span style={{ color: '#94a3b8' }}>Weekly Contribution</span>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>₦{tier.weeklyAmount?.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '10px' }}>
                                <span style={{ color: '#94a3b8' }}>Upgrade Fee</span>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>₦{tier.upgradeFee?.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8' }}>Cycle</span>
                                <span style={{ fontWeight: 'bold', color: '#22d3ee' }}>45 Weeks</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleUpgrade(tier)}
                            style={{
                                width: '100%',
                                padding: '15px',
                                borderRadius: '10px',
                                fontWeight: 'bold',
                                background: '#22d3ee',
                                color: '#0f172a',
                                border: 'none',
                                cursor: 'pointer'
                            }}
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
