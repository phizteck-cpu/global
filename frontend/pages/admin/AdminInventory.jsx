import React, { useEffect, useState } from 'react';
import axiosClient from '../../axiosClient';
import { Box, ClipboardList, Plus, Truck, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [requests, setRequests] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: '', priceEstimate: '' });
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, reqRes] = await Promise.all([
                axiosClient.get('/inventory'),
                axiosClient.get('/admin/redemptions')
            ]);
            setInventory(invRes.data);
            setRequests(reqRes.data);
        } catch (error) {
            console.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/inventory', newItem);
            setShowAddModal(false);
            setNewItem({ name: '', quantity: '', unit: '', priceEstimate: '' });
            fetchData();
            setMsg('Item added successfully');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Failed to add item');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await axiosClient.post(`/admin/redemptions/${id}/status`, { status });
            fetchData();
            setMsg(`Request updated to ${status}`);
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            console.error('Update failed');
        }
    };

    const [editingItem, setEditingItem] = useState(null);

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.put(`/inventory/${editingItem.id}`, editingItem);
            setEditingItem(null);
            fetchData();
            setMsg('Item updated successfully');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Failed to update item');
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Are you sure you want to remove this item from inventory?')) return;
        try {
            await axiosClient.delete(`/inventory/${id}`);
            fetchData();
            setMsg('Item removed successfully');
            setTimeout(() => setMsg(''), 3000);
        } catch (error) {
            setMsg('Failed to delete item');
        }
    };

    if (loading && inventory.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10">
                    <h2 className="text-4xl font-black font-heading text-white tracking-tighter">Inventory Control</h2>
                    <p className="text-noble-gray mt-2 italic font-light">Supply chain management & benefit fulfillment terminal.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="relative z-10 bg-white text-black hover:bg-primary hover:text-white px-8 py-4 rounded-2xl font-black uppercase tracking-tighter text-sm transition-all shadow-xl active:scale-95 flex items-center gap-3 group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                    Restock Vault
                </button>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {msg && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl text-sm font-bold flex items-center gap-3 backdrop-blur-md"
                    >
                        <CheckCircle size={18} />
                        {msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Stock Management Table */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex items-center gap-3 ml-2">
                        <Box className="text-primary" size={24} />
                        <h3 className="text-xl font-bold text-white font-heading">Current Commodities</h3>
                    </div>
                    <div className="glass-card rounded-[2rem] overflow-hidden border-white/5 shadow-premium">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-noble-gray">Item Category</th>
                                        <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-noble-gray">Stock Level</th>
                                        <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-noble-gray">Estimated Market Value</th>
                                        <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-noble-gray">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {inventory.map((item) => (
                                        <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-6 font-bold text-white text-lg">{item.name}</td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${item.quantity < 10
                                                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                        : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                        {item.quantity} {item.unit}
                                                    </span>
                                                    {item.quantity < 10 && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-2xl font-black font-heading tracking-tighter text-white/80">
                                                ₦{item.priceEstimate?.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setEditingItem({
                                                            id: item.id,
                                                            name: item.name,
                                                            quantity: item.quantity,
                                                            unit: item.unit,
                                                            priceEstimate: item.priceEstimate
                                                        })}
                                                        className="p-2 text-noble-gray hover:text-white transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        className="p-2 text-red-500/50 hover:text-red-500 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {inventory.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-8 py-20 text-center text-noble-gray italic">No inventory records found. Add stock to begin.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Redemption Requests Queue */}
                <div className="lg:col-span-12 space-y-6">
                    <div className="flex items-center gap-3 ml-2">
                        <ClipboardList className="text-secondary" size={24} />
                        <h3 className="text-xl font-bold text-white font-heading">Fulfillment Queue</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.length === 0 ? (
                            <div className="md:col-span-2 lg:col-span-3 glass-card p-12 rounded-[2rem] text-center space-y-4 border-dashed border-white/10">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-noble-gray">
                                    <Truck size={32} />
                                </div>
                                <p className="text-noble-gray italic font-light">The queue is currently clear.</p>
                            </div>
                        ) : (
                            requests.map((req) => (
                                <div key={req.id} className="glass-card p-8 rounded-[2rem] border-white/10 hover:border-primary/30 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-xl font-black font-heading text-white group-hover:text-primary transition-colors">{req.user?.fullName}</h4>
                                            <p className="text-[10px] uppercase tracking-widest text-noble-gray mt-1">Requested: {new Date(req.requestDate).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${req.status === 'DELIVERED'
                                            ? 'bg-primary/10 text-primary border-primary/20'
                                            : 'bg-secondary/10 text-secondary border-secondary/20'}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl mb-6 flex items-start gap-3">
                                        <Truck className="text-noble-gray shrink-0 mt-1" size={16} />
                                        <p className="text-sm text-white/60 leading-relaxed italic">{req.deliveryAddress}</p>
                                    </div>

                                    {req.status === 'REQUESTED' && (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                                                className="flex-1 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all active:scale-[0.98]"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(req.id, 'DELIVERED')}
                                                className="flex-1 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-secondary transition-all active:scale-[0.98]"
                                            >
                                                Confirm Fulfiled
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Premium Add/Edit Modal */}
            <AnimatePresence>
                {(showAddModal || editingItem) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] max-w-lg w-full shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                        >
                            <div className="mb-8">
                                <h3 className="text-3xl font-black font-heading text-white tracking-tighter">
                                    {editingItem ? 'Update Vault Item' : 'Vault Restock'}
                                </h3>
                                <p className="text-noble-gray text-sm mt-1">Enter commodity details to update the cooperative inventory.</p>
                            </div>

                            <form onSubmit={editingItem ? handleUpdateItem : handleAddItem} className="space-y-6 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">Commodity Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingItem ? editingItem.name : newItem.name}
                                        onChange={e => editingItem
                                            ? setEditingItem({ ...editingItem, name: e.target.value })
                                            : setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-4 text-white p-5 focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="e.g. Royal Long Grain Rice (50kg)"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">Units in Stock</label>
                                        <input
                                            required
                                            type="number"
                                            value={editingItem ? editingItem.quantity : newItem.quantity}
                                            onChange={e => editingItem
                                                ? setEditingItem({ ...editingItem, quantity: e.target.value })
                                                : setNewItem({ ...newItem, quantity: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-4 text-white p-5 focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                            placeholder="100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">Unit Type</label>
                                        <input
                                            required
                                            type="text"
                                            value={editingItem ? editingItem.unit : newItem.unit}
                                            onChange={e => editingItem
                                                ? setEditingItem({ ...editingItem, unit: e.target.value })
                                                : setNewItem({ ...newItem, unit: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-4 text-white p-5 focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                            placeholder="bags"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">Estimated Market Value (₦)</label>
                                    <input
                                        required
                                        type="number"
                                        value={editingItem ? editingItem.priceEstimate : newItem.priceEstimate}
                                        onChange={e => editingItem
                                            ? setEditingItem({ ...editingItem, priceEstimate: e.target.value })
                                            : setNewItem({ ...newItem, priceEstimate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-4 text-white p-5 focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                        placeholder="55000"
                                    />
                                </div>
                                <div className="flex gap-6 mt-10 pt-6 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                                        className="flex-1 py-4 text-noble-gray font-black uppercase tracking-widest text-xs hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-primary text-white font-black uppercase tracking-tighter rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {editingItem ? 'Save Changes' : 'Confirm Entry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminInventory;
