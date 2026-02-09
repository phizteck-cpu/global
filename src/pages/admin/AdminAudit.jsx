import React, { useEffect, useState } from 'react';
import api from '../../api';
import {
    History,
    Shield,
    Printer,
    Search,
    Terminal,
    ExternalLink,
    AlertCircle,
    FileText,
    Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAudit = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/admin/audit-logs');
                setLogs(res.data);
            } catch (error) {
                console.error('Failed to fetch logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(l =>
        l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.admin?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.targetUser?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const stats = [
        { label: 'Total Operations', value: logs.length, icon: History, color: 'text-primary' },
        { label: 'Critical Events', value: logs.filter(l => l.action.includes('REJECT') || l.action.includes('SUSPEND')).length, icon: AlertCircle, color: 'text-red-500' },
        { label: 'Last Registry Update', value: logs.length > 0 ? new Date(logs[0].timestamp).toLocaleTimeString() : 'N/A', icon: Cpu, color: 'text-secondary' },
    ];

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Ledger Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-gradient-to-br from-[#0f172a] to-black p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-3 text-secondary mb-2">
                        <Terminal size={18} />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Institutional Ledger v4.1</span>
                    </div>
                    <h2 className="text-5xl font-black font-heading text-white tracking-tighter leading-none">Security Audit Logs</h2>
                    <p className="text-noble-gray italic font-light max-w-md">Immutable record of every administrative action within the ValueHills network.</p>
                </div>

                <div className="relative z-10 flex gap-4 print:hidden">
                    <div className="relative group w-64 md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-noble-gray group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Filter by action, admin, or detail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs text-white outline-none focus:border-primary/50 transition-all font-mono"
                        />
                    </div>
                    <button onClick={() => window.print()} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white p-4 rounded-2xl transition-all active:scale-95">
                        <Printer size={20} />
                    </button>
                </div>
            </div>

            {/* Metric Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="glass-card p-6 rounded-[2rem] border-white/5 flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-noble-gray">{stat.label}</p>
                            <h4 className="text-2xl font-black text-white">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            {/* Audit Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-premium">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5 text-noble-gray">
                            <tr>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Temporal Stamp</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Administrative Entity</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">System Action</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Target Hash</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Network Origin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredLogs.map((log) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group hover:bg-white/[0.02] transition-all"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-white font-bold text-sm font-mono">{new Date(log.timestamp).toLocaleDateString()}</p>
                                                <p className="text-[10px] text-noble-gray font-mono">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-xs text-white group-hover:border-primary/50 transition-colors">
                                                    {log.admin?.fullName?.[0] || 'A'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{log.admin?.fullName || 'System'}</p>
                                                    <p className="text-[10px] text-noble-gray">{log.admin?.role || 'CORE_SYSTEM'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${log.action.includes('APPROVE') || log.action.includes('PAY')
                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                : log.action.includes('REJECT') || log.action.includes('SUSPEND')
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : 'bg-secondary/10 text-secondary border-secondary/20'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1 max-w-[200px]">
                                                {log.targetUser ? (
                                                    <>
                                                        <p className="text-xs font-bold text-white truncate">{log.targetUser.fullName}</p>
                                                        <p className="text-[10px] text-noble-gray truncate">@{log.targetUser.username} | {log.targetUser.email}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-[10px] text-noble-gray italic">Global System Parameter</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] font-mono text-noble-gray font-bold px-2 py-1 bg-white/5 rounded-md">
                                                    {log.ipAddress || '127.0.0.1'}
                                                </span>
                                                <div className="flex items-center gap-1 text-[8px] text-emerald-500 uppercase tracking-widest font-black">
                                                    <Shield size={8} /> Encrypted
                                                </div>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center text-noble-gray italic">
                                        <div className="flex flex-col items-center gap-4 opacity-30 font-heading">
                                            <History size={48} />
                                            <p className="text-xl">No ledger entries match your security filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Compliance Footer */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                        <Shield size={24} />
                    </div>
                    <div>
                        <p className="text-white font-black uppercase tracking-widest text-xs">Compliance Notice</p>
                        <p className="text-noble-gray text-[10px] max-w-sm">This ledger is cryptographically secured. Unauthorized modification of audit records is strictly prohibited and monitored by external auditors.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-noble-gray flex items-center gap-2">
                        <FileText size={14} /> Download PDF
                    </div>
                    <div className="px-6 py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20">
                        <ExternalLink size={14} /> External Verification
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAudit;
