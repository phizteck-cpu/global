import React, { useEffect, useState } from 'react';
import api from '../api';
import {
    User,
    Mail,
    Phone,
    Shield,
    Upload,
    Clock,
    LogOut,
    Trophy,
    Key,
    Globe,
    CheckCircle2,
    AlertCircle,
    Fingerprint,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [kycFile, setKycFile] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/me');
                setProfile(res.data);
            } catch (error) {
                console.error('Failed to fetch profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleKycSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/me/kyc', { kycDocUrl: kycFile });
            setMsg('KYC Documents Encrypted & Transmitted. Verification Pending.');
            const res = await api.get('/users/me');
            setProfile(res.data);
        } catch (error) {
            setMsg('Protocol Error: Upload Failed.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const isKycVerified = profile.kycStatus === 'VERIFIED';
    const initials = (profile.firstName?.[0] || '') + (profile.lastName?.[0] || '');

    return (
        <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto">
            {/* Header Terminal */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-gradient-to-br from-slate-900 to-black p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 flex items-center gap-8">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 p-1">
                        <div className="w-full h-full rounded-[1.2rem] bg-slate-900 flex items-center justify-center text-4xl font-black text-white">
                            {initials}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-primary mb-1">
                            <Fingerprint size={16} />
                            <span className="text-[10px] uppercase tracking-[0.4em] font-black">Entity Profile v4.0</span>
                        </div>
                        <h2 className="text-5xl font-black font-heading text-white tracking-tighter leading-none">{profile.firstName} {profile.lastName}</h2>
                        <div className="flex items-center gap-4">
                            <p className="text-noble-gray font-mono text-xs italic tracking-widest">{profile.referralCode}</p>
                            <span className="w-1.5 h-1.5 bg-noble-gray rounded-full opacity-30"></span>
                            <p className="text-primary text-[10px] uppercase font-black tracking-widest">{profile.role} ACCESS</p>
                        </div>
                    </div>
                </div>
                <div className="relative z-10">
                    <div className={`px-6 py-3 rounded-2xl border flex items-center gap-3 ${isKycVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                        {isKycVerified ? <ShieldCheck size={16} /> : <AlertCircle size={16} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isKycVerified ? 'Security Verified' : 'Security Pending'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Identity & Contact */}
                <div className="xl:col-span-8 space-y-10">
                    <div className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-10">
                            <User className="text-primary" size={20} />
                            <h3 className="text-xl font-black font-heading text-white uppercase tracking-tighter">Identity Registry</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <ProfileItem label="Electronic Mail" value={profile.email} icon={<Mail size={14} />} />
                            <ProfileItem label="Voice Protocol" value={profile.phone || 'NOT LINKED'} icon={<Phone size={14} />} />
                            <ProfileItem label="Citizenship Status" value="NIGERIAN (RESIDENT)" icon={<Globe size={14} />} />
                            <ProfileItem label="Auth Key" value="******** (SECRET)" icon={<Key size={14} />} />
                        </div>
                    </div>

                    <div className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-secondary" size={20} />
                            <h3 className="text-xl font-black font-heading text-white uppercase tracking-tighter">Institutional Verification</h3>
                        </div>
                        <p className="text-sm text-noble-gray mb-10 italic font-light">Verified entities unlock premium tiers and increased capital mobility.</p>

                        {!isKycVerified && profile.kycStatus !== 'PENDING' ? (
                            <form onSubmit={handleKycSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray ml-2 flex items-center gap-2">
                                        <Upload size={12} /> ID Document Vault Link (Cloud PDF/IMAGE)
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={kycFile}
                                        onChange={(e) => setKycFile(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-primary/50 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold"
                                        placeholder="https://ipfs.io/ipfs/..."
                                    />
                                </div>
                                <button className="w-full py-5 bg-white text-black font-black uppercase tracking-tighter rounded-2xl shadow-xl hover:bg-primary hover:text-white transition-all active:scale-[0.98]">
                                    Initialize Security Audit
                                </button>
                            </form>
                        ) : (
                            <div className="p-10 border border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center text-center space-y-4">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isKycVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'}`}>
                                    {isKycVerified ? <ShieldCheck size={40} /> : <Clock size={40} />}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white font-heading">{isKycVerified ? 'Audit Complete' : 'Manual Audit In-Progress'}</h4>
                                    <p className="text-noble-gray text-sm italic mt-2">
                                        {isKycVerified ? 'Your electronic identity is fully verified for all cooperative operations.' : 'Our compliance algorithms are currently validating your transmitted documents. 24-48h average.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="glass-card p-10 rounded-[3rem] border-white/5 space-y-10">
                        <div className="flex items-center gap-3 text-amber-500">
                            <Trophy size={20} />
                            <h3 className="text-xl font-black font-heading text-white tracking-tighter uppercase">Stake Level</h3>
                        </div>

                        {profile.tier ? (
                            <div className="space-y-6">
                                <div>
                                    <p className="text-3xl font-black text-white font-heading leading-tight">{profile.tier.name}</p>
                                    <p className="text-[10px] text-noble-gray uppercase font-bold tracking-[0.2em] mt-1">Institutional Cycle</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div className="h-full bg-primary" style={{ width: `${((profile.contributions?.length || 0) / 45) * 100}%` }}></div>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-primary">{profile.contributions?.length || 0} Cycles Completed</span>
                                        <span className="text-noble-gray">45 Total</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 py-4">
                                <p className="text-noble-gray italic text-sm">No stake identified.</p>
                                <button onClick={() => navigate('/packages')} className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Explore Tiers</button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-6 glass-card rounded-2xl border-white/5 text-white hover:bg-white/5 hover:border-primary/30 transition-all text-xs font-black uppercase tracking-widest">
                            Security Settings <Key size={14} className="text-noble-gray" />
                        </button>
                        <button className="w-full flex items-center justify-between p-6 glass-card rounded-2xl border-white/5 text-white hover:bg-white/5 hover:border-primary/30 transition-all text-xs font-black uppercase tracking-widest">
                            Help Terminal <Globe size={14} className="text-noble-gray" />
                        </button>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-between p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest shadow-lg"
                        >
                            Terminate Session <LogOut size={16} />
                        </button>
                    </div>

                    <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[3rem] py-10">
                        <div className="flex items-center gap-3 mb-4 text-primary">
                            <ShieldCheck size={20} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">ValueHills Promise</p>
                        </div>
                        <p className="text-xs text-white/70 italic leading-relaxed">Your electronic assets and personal data are protected by military-grade AES-256 encryption. We operate under strict cooperative ethical guidelines.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProfileItem = ({ label, value, icon }) => (
    <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-widest font-black text-noble-gray flex items-center gap-2">
            {icon} {label}
        </label>
        <p className="text-lg font-black text-white truncate font-heading tracking-tight">{value}</p>
    </div>
);

export default Profile;
