import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data || []);
            } catch (error) {
                console.error('Failed to fetch notifications');
            }
        };
        if (user) fetchNotifications();
    }, [user]);

    const initials = (user?.firstName?.[0] || 'U') + (user?.lastName?.[0] || '');

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            height: '70px',
            background: 'rgba(15,23,42,0.9)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 25px',
            zIndex: 30
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <button
                    onClick={toggleSidebar}
                    style={{
                        display: 'none',
                        padding: '8px',
                        border: 'none',
                        background: 'transparent',
                        color: '#94a3b8',
                        cursor: 'pointer'
                    }}
                    className="mobile-menu-btn"
                >
                    ☰
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 15px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '25px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    width: '250px'
                }}>
                    <span style={{ color: '#94a3b8' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Quick search..."
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'white',
                            width: '100%',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                            padding: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            position: 'relative'
                        }}
                    >
                        🔔
                        {notifications && notifications.length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                width: '8px',
                                height: '8px',
                                background: '#22d3ee',
                                borderRadius: '50%'
                            }} />
                        )}
                    </button>

                    {showNotifications && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '40px',
                            width: '300px',
                            background: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '15px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            overflow: 'hidden',
                            zIndex: 50
                        }}>
                            <div style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <h4 style={{ fontWeight: 'bold' }}>Notifications</h4>
                            </div>
                            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                {(!notifications || notifications.length === 0) ? (
                                    <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                        No notifications
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>{n.title}</p>
                                            <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{n.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    onClick={() => navigate('/settings')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        paddingLeft: '20px',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ textAlign: 'right', display: 'none' }} className="user-info">
                        <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{user?.firstName} {user?.lastName}</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>{user?.role}</p>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#22d3ee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0f172a',
                        fontWeight: 'bold'
                    }}>
                        {initials}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .mobile-menu-btn { display: block !important; }
                    .user-info { display: block !important; }
                }
            `}</style>
        </header>
    );
};

export default Header;
