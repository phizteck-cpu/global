import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut } from 'lucide-react';

const DashboardLayout = ({ children }) => {
    const { user, stopImpersonating } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isImpersonating = !!localStorage.getItem('adminToken');

    const handleStopImpersonation = () => {
        stopImpersonating();
        navigate('/admin/users');
    };

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
        <div className="min-h-screen bg-background text-slate-900 flex flex-col">
            {isImpersonating && (
                <div className="w-full bg-amber-500 text-black px-6 py-2 flex items-center justify-between z-[100] animate-pulse">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">
                            Shadow Mode Active: Watching Dashboard as <span className="underline">{user?.fullName}</span>
                        </span>
                    </div>
                    <button
                        onClick={handleStopImpersonation}
                        className="flex items-center gap-2 bg-black text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                        <LogOut size={12} />
                        Return to Admin
                    </button>
                </div>
            )}

            <div className="flex flex-1">
                <Sidebar
                    isMobile={isMobile}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                />

                <div className={`flex-1 flex flex-col transition-all duration-300 ${!isMobile ? 'ml-64' : ''}`}>
                    <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                    <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
