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
                // Using the standard api instance
                const res = await api.get('/packages');
                setTiers(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, tierId: res.data[0].id }));
                }
            } catch (err) {
                console.error("Failed to load tiers", err);
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
            <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent mb-2">Create Account</h1>
                    <p className="text-slate-500">Join Valuehills and start your journey</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all bg-white/50"
                                placeholder="John"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all bg-white/50"
                                placeholder="Doe"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all bg-white/50"
                                placeholder="you@example.com"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                required
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all bg-white/50"
                                placeholder="+234..."
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all bg-white/50"
                            placeholder="••••••••"
                            onChange={handleChange}
                        />
                    </div>

                    {/* Tier Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Select Membership Tier</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {tiers.map((tier) => (
                                <div key={tier.id}
                                    onClick={() => setFormData({ ...formData, tierId: tier.id })}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${parseInt(formData.tierId) === tier.id ? 'border-brand-green bg-green-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                    <h3 className="font-bold text-slate-800">{tier.name}</h3>
                                    <p className="text-sm text-slate-500">₦{tier.weeklyAmount.toLocaleString()}/wk</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-sm text-slate-500 mt-2 bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex items-center gap-2">
                        <span className="text-yellow-600">ⓘ</span>
                        <span>Registration Fee: <span className="font-bold text-yellow-700">₦3,000</span> (One-time)</span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-brand-green to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-70"
                    >
                        {loading ? 'Registering...' : 'Register & Pay Fee'}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-600">
                    Already have an account? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
