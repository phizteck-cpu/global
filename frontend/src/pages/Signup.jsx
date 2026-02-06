import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        phone: '',
        password: '',
        tierId: ''
    });
    const [tiers, setTiers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const res = await api.get('/packages');
                setTiers(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, tierId: res.data[0].id }));
                }
            } catch (err) {
                console.error('Failed to load tiers', err);
            }
        };
        fetchTiers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
            <div className="absolute top-0 left-1/3 w-[32rem] h-[32rem] bg-primary/10 rounded-full blur-[140px]" />
            <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] bg-secondary/10 rounded-full blur-[140px]" />

            <div className="max-w-2xl w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold font-heading text-white mb-2">Create Account</h1>
                    <p className="text-noble-gray">Join the cooperative and start your journey</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 text-red-300 text-sm rounded-lg border border-red-500/30">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-noble-gray mb-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                                placeholder="John"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-noble-gray mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                                placeholder="Doe"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-noble-gray mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                                placeholder="you@example.com"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-noble-gray mb-1">Username</label>
                            <input
                                type="text"
                                name="username"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                                placeholder="johndoe123"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-noble-gray mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                                placeholder="+234..."
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-noble-gray mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                                placeholder="••••••••"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-noble-gray mb-3">Select Membership Tier</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {tiers.map((tier) => (
                                <div
                                    key={tier.id}
                                    onClick={() => setFormData({ ...formData, tierId: tier.id })}
                                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${parseInt(formData.tierId) === tier.id ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-white/30'}`}
                                >
                                    <h3 className="font-bold text-white">{tier.name}</h3>
                                    <p className="text-sm text-noble-gray">?{tier.weeklyAmount.toLocaleString()}/wk</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-sm text-noble-gray mt-2 bg-white/5 p-3 rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="text-secondary">?</span>
                        <span>Registration Fee: <span className="font-bold text-white">?{tiers.find(t => t.id === parseInt(formData.tierId))?.onboardingFee?.toLocaleString() || '0'}</span> (One-time)</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary text-background rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 disabled:opacity-70"
                    >
                        {loading ? 'Registering...' : 'Register & Pay Fee'}
                    </button>
                </form>

                <p className="mt-6 text-center text-noble-gray">
                    Already have an account? <Link to="/login" className="text-primary font-semibold hover:text-white">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
