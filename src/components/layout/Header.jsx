import React, { useState, useEffect } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await api.get('/notifications');
                setNotifications(res.data);
            } catch (error) {
                console.error('Failed to fetch notifications');
            }
        };
        if (user) fetchNotifications();
    }, [user]);

    const initials = user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
        <header className="sticky top-0 z-30 h-20 px-6 nav-blur border-b border-white/5 bg-background/80 backdrop-blur-md flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 lg:hidden text-noble-gray hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                    <Menu size={24} />
                </button>

                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 focus-within:border-primary/30 transition-colors w-64">
                    <Search size={18} className="text-noble-gray" />
                    <input
                        type="text"
                        placeholder="Quick search..."
                        className="bg-transparent border-none outline-none text-sm text-white placeholder-noble-gray w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-noble-gray hover:text-primary transition-colors relative"
                    >
                        <Bell size={20} />
                        {notifications.some(n => !n.isRead) && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-4 w-80 bg-surfaceHighlight border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                            >
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <h4 className="font-bold">Notifications</h4>
                                    <button className="text-xs text-primary hover:underline">Mark all read</button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-noble-gray italic text-sm">No new alerts.</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}>
                                                <p className="text-xs font-bold text-white mb-1">{n.title}</p>
                                                <p className="text-[11px] text-noble-gray line-clamp-2">{n.message}</p>
                                                <p className="text-[9px] text-noble-gray/50 mt-1 uppercase font-mono">{new Date(n.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-3 pl-6 border-l border-white/10 cursor-pointer group"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{user?.fullName || 'Member'}</p>
                        <p className="text-[10px] text-noble-gray uppercase tracking-widest">{user?.role || 'Member'}</p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-emerald-600 border-2 border-white/10 flex items-center justify-center text-background font-bold"
                    >
                        {initials}
                    </motion.div>
                </div>
            </div>
        </header>
    );
};

export default Header;
