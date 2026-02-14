import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) setIsSidebarOpen(true);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flex: 1 }}>
                <Sidebar
                    isMobile={isMobile}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />

                <div style={{ 
                    flex: 1, 
                    marginLeft: isMobile ? '0' : '260px',
                    transition: 'margin-left 0.3s ease'
                }}>
                    <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                    <main style={{ padding: '25px', overflowX: 'hidden' }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
