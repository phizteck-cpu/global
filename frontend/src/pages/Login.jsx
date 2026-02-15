import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setIsLoading(true);

        try {
            const result = await login(username, password);

            if (result.success) {
                const adminRoles = ['ADMIN', 'SUPERADMIN', 'FINANCE_ADMIN', 'OPS_ADMIN', 'SUPPORT_ADMIN'];
                if (adminRoles.includes(result.role)) {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setServerError(result.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            setServerError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#0f172a',
            padding: '20px'
        }}>
            <div style={{ 
                maxWidth: '450px', 
                width: '100%', 
                background: 'rgba(30,41,59,0.8)', 
                padding: '40px', 
                borderRadius: '30px', 
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ 
                        width: '70px', 
                        height: '70px', 
                        background: 'rgba(34,211,238,0.1)', 
                        borderRadius: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 15px'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px' }}>
                        <span style={{ color: 'white' }}>Value</span>
                        <span style={{ color: '#22d3ee' }}>Hills</span>
                    </h1>
                    <p style={{ color: '#94a3b8' }}>Welcome back to your cooperative hub.</p>
                </div>

                {serverError && (
                    <div style={{ 
                        padding: '15px', 
                        background: 'rgba(239,68,68,0.1)', 
                        border: '1px solid rgba(239,68,68,0.3)', 
                        borderRadius: '10px', 
                        color: '#f87171', 
                        marginBottom: '20px',
                        fontSize: '0.9rem'
                    }}>
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ marginBottom: '25px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem', marginLeft: '5px' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            minLength={3}
                            style={{
                                width: '100%',
                                padding: '15px 20px',
                                borderRadius: '15px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                            placeholder="Enter your username"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem', marginLeft: '5px' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '15px 20px',
                                    paddingRight: '50px',
                                    borderRadius: '15px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer'
                                }}
                            >
                                {showPassword ? '👁' : '👁‍🗨'}
                            </button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '25px' }}>
                        <Link to="/forgot-password" style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }}>
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '15px',
                            border: 'none',
                            background: '#22d3ee',
                            color: '#0f172a',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    border: '2px solid #0f172a', 
                                    borderTopColor: 'transparent', 
                                    borderRadius: '50%', 
                                    animation: 'spin 1s linear infinite' 
                                }} />
                                Authenticating...
                            </>
                        ) : (
                            'Access Dashboard'
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Not a member yet?{' '}
                    <Link to="/signup" style={{ color: '#22d3ee', fontWeight: 'bold', textDecoration: 'none' }}>
                        Join the Network
                    </Link>
                </p>

                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    Are you staff?{' '}
                    <Link to="/admin/login" style={{ color: '#f97316', fontWeight: 'bold', textDecoration: 'none' }}>
                        Institutional Access
                    </Link>
                </p>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                input::placeholder { color: rgba(255,255,255,0.3); }
                input:focus { border-color: rgba(34,211,238,0.5) !important; }
            `}</style>
        </div>
    );
};

export default Login;
