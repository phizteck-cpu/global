import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/me');
                setProfile(res.data);
            } catch (error) {
                console.error('Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMsg('Passwords do not match');
            return;
        }
        try {
            await api.post('/users/me/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMsg('Password changed successfully');
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMsg(error.response?.data?.error || 'Failed to change password');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                Loading Profile...
            </div>
        );
    }

    return (
        <div style={{ color: 'white' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>Profile</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Manage your account settings.</p>

            {msg && (
                <div style={{ padding: '15px', background: msg.includes('success') ? 'rgba(34,211,238,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('success') ? 'rgba(34,211,238,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '10px', marginBottom: '20px', color: msg.includes('success') ? '#22d3ee' : '#f87171' }}>
                    {msg}
                </div>
            )}

            <div style={{ background: 'rgba(30,41,59,0.8)', padding: '30px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#0f172a' }}>
                        {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{profile?.firstName} {profile?.lastName}</h3>
                        <p style={{ color: '#94a3b8' }}>@{profile?.username}</p>
                        <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '0.7rem',
                            background: profile?.status === 'ACTIVE' ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.2)',
                            color: profile?.status === 'ACTIVE' ? '#34d399' : '#f59e0b'
                        }}>
                            {profile?.status}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px' }}>Email</p>
                        <p style={{ fontWeight: 'bold' }}>{profile?.email}</p>
                    </div>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px' }}>Phone</p>
                        <p style={{ fontWeight: 'bold' }}>{profile?.phone || 'Not set'}</p>
                    </div>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px' }}>Tier</p>
                        <p style={{ fontWeight: 'bold', color: '#22d3ee' }}>{profile?.tier?.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '5px' }}>Member Since</p>
                        <p style={{ fontWeight: 'bold' }}>{new Date(profile?.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div style={{ background: 'rgba(30,41,59,0.8)', padding: '30px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '25px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>Security</h3>
                
                <button
                    onClick={() => setShowPasswordModal(true)}
                    style={{
                        padding: '12px 25px',
                        borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'transparent',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginRight: '15px'
                    }}
                >
                    Change Password
                </button>
                
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '12px 25px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'rgba(239,68,68,0.2)',
                        color: '#f87171',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>

            <div style={{ background: 'rgba(30,41,59,0.8)', padding: '30px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>Referral Code</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={profile?.referralCode || ''}
                        readOnly
                        style={{
                            flex: 1,
                            padding: '12px 15px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.3)',
                            color: '#22d3ee',
                            fontSize: '1rem',
                            fontFamily: 'monospace'
                        }}
                    />
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(profile?.referralCode);
                            alert('Copied!');
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

            {showPasswordModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{ background: '#1e293b', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', width: '90%', maxWidth: '400px' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '20px' }}>Change Password</h3>
                        
                        <form onSubmit={handlePasswordChange}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    required
                                    minLength={8}
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8' }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#22d3ee', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Change
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
