import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    Users,
    LogOut,
    LayoutTemplate,
    CheckCircle,
    FileText,
    ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isMobile, isOpen, setIsOpen }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const navItems = [
        { icon: LayoutTemplate, label: 'Overview', path: '/admin' },
        { icon: ShieldAlert, label: 'Staff Management', path: '/admin/management', roles: ['SUPERADMIN'] },
        { icon: ShoppingBag, label: 'Manage Tiers', path: '/admin/packages', roles: ['SUPERADMIN'] },
        { icon: ShoppingBag, label: 'Inventory (Food)', path: '/admin/inventory' },
        { icon: CheckCircle, label: 'Payout Approvals', path: '/admin/approvals' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: FileText, label: 'Audit Logs', path: '/admin/audit', roles: ['SUPERADMIN'] },
    ].filter(item => !item.roles || item.roles.includes(user?.role));

    const handleLogout = () => {
        logout();
        navigate('/');
    };

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
                className={`fixed left-0 top-0 h-full w-64 bg-surface/95 backdrop-blur-xl border-r border-white/5 z-50 flex flex-col ${isMobile ? '' : 'translate-x-0'}`}
            >
                <div className="p-6 flex items-center justify-center border-b border-white/5">
                    <h1 className="text-2xl font-bold font-heading tracking-tight flex items-center gap-2">
                        <span className="text-white">Value</span>
                        <span className="text-primary">Hills</span>
                        <span className="text-[10px] uppercase bg-red-500/20 text-red-500 px-2 py-0.5 rounded tracking-wider border border-red-500/20">Admin</span>
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'} // Only exact match for root admin
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                                    ? 'bg-gradient-to-r from-red-500/10 to-transparent text-red-500 font-medium border border-red-500/20'
                                    : 'text-noble-gray hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        size={20}
                                        className={`transition-colors ${isActive ? 'text-red-500' : 'text-noble-gray group-hover:text-red-500'}`}
                                    />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabAdmin"
                                            className="absolute left-0 top-0 w-1 h-full bg-red-500 rounded-r-full"
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-noble-gray hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
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

export default AdminSidebar;
