import React, { useEffect, useState } from 'react';
import api from '../api';

const Redeem = () => {
    const [inventory, setInventory] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const invRes = await api.get('/admin/inventory');
                setInventory(invRes.data || []);
            } catch (error) {
                console.error('Failed to fetch inventory');
                setInventory([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRedeem = async (item) => {
        try {
            await api.post('/redemptions', { inventoryId: item.id });
            setMsg('Redemption request submitted successfully!');
            setSelectedItem(null);
        } catch (error) {
            setMsg(error.response?.data?.error || 'Redemption failed');
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{ color: 'white' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>Food Store</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Redeem your points for food items.</p>

            {msg && (
                <div style={{ padding: '15px', background: msg.includes('success') ? 'rgba(34,211,238,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('success') ? 'rgba(34,211,238,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '10px', marginBottom: '20px', color: msg.includes('success') ? '#22d3ee' : '#f87171' }}>
                    {msg}
                </div>
            )}

            {(!inventory || inventory.length === 0) ? (
                <div style={{ padding: '60px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: '1.2rem', color: '#94a3b8' }}>No items available in the store.</p>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '10px' }}>Check back later for new items.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {inventory.map((item) => (
                        <div key={item.id} style={{ background: 'rgba(30,41,59,0.8)', padding: '25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '10px' }}>{item.name}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '15px' }}>{item.quantity} {item.unit} available</p>
                            
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>Estimated Value</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: '900', color: '#22d3ee' }}>₦{item.priceEstimate?.toLocaleString()}</p>
                            </div>
                            
                            <button
                                onClick={() => handleRedeem(item)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'rgba(34,211,238,0.1)',
                                    color: '#22d3ee',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = '#22d3ee';
                                    e.target.style.color = '#0f172a';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = 'rgba(34,211,238,0.1)';
                                    e.target.style.color = '#22d3ee';
                                }}
                            >
                                Redeem
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Redeem;
