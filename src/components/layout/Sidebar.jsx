import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Wallet,
    Users,
    Settings,
    LogOut,
    Menu,
    ShoppingBasket
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isMobile, isOpen, setIsOpen }) => {
    const { logout } = useAuth();
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Package, label: 'Membership', path: '/packages' },
        { icon: ShoppingBasket, label: 'Food Store', path: '/redeem' },
        { icon: Wallet, label: 'Wallet', path: '/wallet' },
        { icon: Users, label: 'My Network', path: '/network' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const sidebarVariants = {
        open: { x: 0, opacity: 1 },
        closed: { x: -280, opacity: 0 },
    };

    return (
        <>
            <motion.aside
                initial={isMobile ? "closed" : "open"}
                animate={isMobile ? (isOpen ? "open" : "closed") : "open"}
                variants={isMobile ? sidebarVariants : undefined}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`fixed left-0 top-0 h-full w-64 bg-background/95 backdrop-blur-md border-r border-white/10 z-50 flex flex-col ${isMobile ? '' : 'translate-x-0'}`}
            >
                <div className="p-6 flex items-center justify-center border-b border-white/10">
                    <h1 className="text-2xl font-bold font-heading tracking-tight">
                        <span className="text-white text-3xl font-heading tracking-widest uppercase">Value</span>
                        <span className="text-primary font-heading tracking-widest uppercase">Hills</span>
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary'
                                    : 'text-noble-gray hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        size={20}
                                        className={`transition-colors ${isActive ? 'text-primary' : 'text-noble-gray group-hover:text-white'}`}
                                    />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute left-0 top-0 w-1 h-full bg-primary rounded-r-full hidden"
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-noble-gray hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
