import React, { useEffect, useState } from 'react';
import api from '../api';
import { ShoppingBasket, History, Truck, MapPin, CheckCircle2, ChevronRight, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Redeem = () => {
    const [inventory, setInventory] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [address, setAddress] = useState('');
    const [pin, setPin] = useState('');
    const [msg, setMsg] = useState('');
    const [msgType, setMsgType] = useState('success');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invRes, histRes] = await Promise.all([
                api.get('/inventory'),
                api.get('/redemptions')
            ]);
            setInventory(invRes.data);
            setHistory(histRes.data);
        } catch (error) {
            console.error('Failed to load redemption data');
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (e) => {
        e.preventDefault();
        if (!selectedItem) return;

        try {
            await api.post('/redemptions', {
                inventoryId: selectedItem.id,
                deliveryAddress: address,
                pin
            });
            setMsg('Redemption request submitted! Our fulfillment team will contact you shortly.');
            setMsgType('success');
            setSelectedItem(null);
            setAddress('');
            setPin('');
            fetchData();
            setTimeout(() => setMsg(''), 5000);
        } catch (error) {
            setMsg(error.response?.data?.error || 'Request failed');
            setMsgType('error');
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
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Header */}
            <div className="relative p-10 bg-gradient-to-br from-surfaceHighlight/60 to-background rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -z-0 translate-x-1/3 -translate-y-1/3" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-5xl font-black font-heading text-white tracking-tighter">Commodity Vault</h2>
                        <p className="text-noble-gray mt-2 italic font-light max-w-md">Redeem your accumulated cooperative benefits for essential high-quality food commodities.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                        <ShoppingBasket size={32} className="text-primary" />
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-noble-gray font-black">Stock Status</p>
                            <p className="text-white font-bold">{inventory.length} Categories Available</p>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {msg && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-5 rounded-2xl border font-bold flex items-center gap-3 backdrop-blur-md shadow-lg ${msgType === 'success' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                    >
                        {msgType === 'success' ? <CheckCircle2 size={20} /> : <Box size={20} />}
                        {msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inventory Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {inventory.length === 0 ? (
                    <div className="col-span-full p-20 glass-card rounded-[3rem] text-center border-dashed border-white/10 opacity-50 space-y-4">
                        <ShoppingBasket size={64} className="mx-auto text-noble-gray" />
                        <p className="text-xl italic">The vault is currently awaiting restock. Check back shortly.</p>
                    </div>
                ) : (
                    inventory.map((item) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -5 }}
                            className="glass-card p-8 rounded-[2.5rem] flex flex-col justify-between group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                                <Box size={100} />
                            </div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <ShoppingBasket size={32} />
                                </div>
                                <h3 className="text-2xl font-black font-heading text-white tracking-tight">{item.name}</h3>
                                <p className="text-xs text-noble-gray mt-2 font-bold uppercase tracking-widest">{item.quantity} {item.unit} available</p>
                            </div>

                            <div className="mt-10 relative z-10 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-noble-gray font-black">Estimated Value</p>
                                    <p className="text-3xl font-black font-heading text-white">₦{item.priceEstimate.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(item)}
                                    className="w-full py-4 bg-primary/10 hover:bg-primary text-primary hover:text-background rounded-2xl transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 group-btn"
                                >
                                    Fulfill Request <ChevronRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Fulfillment Section */}
            <div className="glass-card rounded-[3rem] overflow-hidden border-white/5 shadow-premium mt-12">
                <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                        <History size={20} />
                    </div>
                    <h3 className="text-2xl font-black font-heading text-white tracking-tighter">Benefit Fulfillment History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.01]">
                            <tr className="text-noble-gray">
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Request Date</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black">Fulfillment Details</th>
                                <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.map((record) => (
                                <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <p className="text-white font-bold">{new Date(record.requestDate).toLocaleDateString()}</p>
                                        <p className="text-[10px] text-noble-gray">{new Date(record.requestDate).toLocaleTimeString()}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-start gap-3">
                                            <Truck className="text-noble-gray mt-1 shrink-0" size={16} />
                                            <p className="text-white/80 italic font-light max-w-md">{record.deliveryAddress}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${record.status === 'DELIVERED' ? 'bg-primary/10 text-primary border-primary/20' :
                                            record.status === 'REQUESTED' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center text-noble-gray italic">No benefit history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-surface p-10 rounded-[3rem] border border-white/10 max-w-lg w-full relative shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                        >
                            <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 text-noble-gray hover:text-white transition-colors">
                                <ChevronRight size={32} className="rotate-45" />
                            </button>

                            <div className="mb-8 space-y-2">
                                <h3 className="text-3xl font-black font-heading tracking-tighter text-white leading-none">Confirm Redemption</h3>
                                <p className="text-noble-gray">Requesting: <span className="text-primary font-bold">{selectedItem.name}</span></p>
                            </div>

                            <form onSubmit={handleRequest} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">
                                        <MapPin size={12} /> Fulfillment Address / Hub Pickup
                                    </label>
                                    <textarea
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full p-6 bg-white/5 rounded-3xl border border-white/10 focus:border-primary/50 text-white h-32 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm leading-relaxed"
                                        placeholder="Enter full delivery coordinates or preferred ValueHills pickup hub..."
                                    ></textarea>
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2">
                                        Security Transaction PIN
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        maxLength={6}
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 focus:border-primary/50 text-white outline-none text-center font-mono tracking-widest text-lg"
                                        placeholder="••••••"
                                    />
                                </div>
                                <button type="submit" className="w-full py-5 bg-primary text-background font-black uppercase tracking-tighter text-lg rounded-[2rem] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20">
                                    Finalize Redemption
                                </button>
                                <p className="text-[10px] text-center text-noble-gray italic leading-relaxed">
                                    *Benefit value will be balanced against your cooperative cycle. Fulfillment usually occurs within 48-72 hours.
                                </p>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Redeem;
