import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isMobile, isOpen, setIsOpen }) => {
    const { logout } = useAuth();
    const navItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Membership', path: '/packages' },
        { label: 'Food Store', path: '/redeem' },
        { label: 'Wallet', path: '/wallet' },
        { label: 'My Network', path: '/network' },
        { label: 'Settings', path: '/settings' },
    ];

    return (
        <>
            <aside style={{
                position: 'fixed',
                left: 0,
                top: 0,
                height: '100vh',
                width: '260px',
                background: 'rgba(15,23,42,0.95)',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 50,
                transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
                transition: 'transform 0.3s ease'
            }}>
                <div style={{ padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>
                        <span style={{ color: 'white', letterSpacing: '0.1em' }}>VALUE</span>
                        <span style={{ color: '#22d3ee', letterSpacing: '0.1em' }}>HILLS</span>
                    </h1>
                </div>

                <nav style={{ flex: 1, padding: '20px 15px', overflowY: 'auto' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 15px',
                                borderRadius: '12px',
                                marginBottom: '5px',
                                textDecoration: 'none',
                                background: isActive ? 'rgba(34,211,238,0.1)' : 'transparent',
                                color: isActive ? '#22d3ee' : '#94a3b8',
                                fontWeight: isActive ? 'bold' : 'normal',
                                borderLeft: isActive ? '3px solid #22d3ee' : '3px solid transparent',
                                transition: 'all 0.2s'
                            })}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 15px',
                            width: '100%',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'transparent',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {isMobile && isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 40
                    }}
                />
            )}
        </>
    );
};

export default Sidebar;
