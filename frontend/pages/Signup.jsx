import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';
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
    const [step, setStep] = useState(1); // 1: Form, 2: Payment Details, 3: Upload Proof
    const [registrationData, setRegistrationData] = useState(null);
    const [companyAccount, setCompanyAccount] = useState(null);
    const [paymentProof, setPaymentProof] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);

    useEffect(() => {
        const fetchTiers = async () => {
            try {
                // Using the standard axiosClient instance
                const res = await axiosClient.get('/packages');
                setTiers(res.data.packages);
                if (res.data.length > 0) {
                    setFormData(prev => ({ ...prev, tierId: res.data[0].id }));
                }
            } catch (err) {
                console.error("Failed to load tiers", err);
            }
        };
        fetchTiers();
    }, []);

    useEffect(() => {
        // Fetch company account details when on step 2
        if (step === 2) {
            fetchCompanyAccount();
        }
    }, [step]);

    const fetchCompanyAccount = async () => {
        try {
            const res = await axiosClient.get('/auth/company-account');
            setCompanyAccount(res.data);
        } catch (err) {
            console.error("Failed to load company account", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Register user (will be PENDING_APPROVAL status)
            const res = await axiosClient.post('/auth/signup', formData);
            setRegistrationData(res.data);
            setStep(2); // Move to payment details step
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('File size must be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed');
                return;
            }
            setPaymentProof(file);
            setError('');
        }
    };

    const handleUploadProof = async (e) => {
        e.preventDefault();
        if (!paymentProof) {
            setError('Please select a payment proof image');
            return;
        }

        setUploadLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('proofImage', paymentProof);
            formData.append('amount', 3000);
            formData.append('type', 'ACTIVATION');

            const res = await axiosClient.post('/auth/upload-activation-proof', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${registrationData.accessToken}`
                }
            });

            // Success - show confirmation
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload payment proof');
        } finally {
            setUploadLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
            <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20">
                {/* Step Indicator */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-brand-green text-white' : 'bg-slate-200 text-slate-500'}`}>1</div>
                        <div className={`w-16 h-1 ${step >= 2 ? 'bg-brand-green' : 'bg-slate-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-brand-green text-white' : 'bg-slate-200 text-slate-500'}`}>2</div>
                        <div className={`w-16 h-1 ${step >= 3 ? 'bg-brand-green' : 'bg-slate-200'}`}></div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-brand-green text-white' : 'bg-slate-200 text-slate-500'}`}>3</div>
                    </div>
                </div>

                {/* Step 1: Registration Form */}
                {step === 1 && (
                    <>
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
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green outline-none transition-all bg-white/50"
                                        placeholder="johndoe123"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            <div className="text-sm text-slate-700 mt-2 bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-amber-600 text-lg">💰</span>
                                    <span className="font-bold text-amber-800">Activation Fee Required</span>
                                </div>
                                <p className="text-amber-700">A one-time activation fee of <span className="font-bold">₦3,000</span> is required to complete your registration.</p>
                                <p className="text-amber-600 text-xs mt-1">You will be provided with payment details in the next step.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-brand-green to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-70"
                            >
                                {loading ? 'Processing...' : 'Continue to Payment'}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-slate-600">
                            Already have an account? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Login</Link>
                        </p>
                    </>
                )}

                {/* Step 2: Payment Details */}
                {step === 2 && companyAccount && (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green to-emerald-600 bg-clip-text text-transparent mb-2">Payment Details</h1>
                            <p className="text-slate-500">Complete your ₦3,000 activation fee payment</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 mb-6">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="text-2xl">🏦</span>
                                Company Bank Account
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Bank Name</p>
                                    <p className="font-bold text-slate-800">{companyAccount.bankName || 'Not Set'}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Account Number</p>
                                    <p className="font-bold text-slate-800 text-xl">{companyAccount.accountNumber || 'Not Set'}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Account Name</p>
                                    <p className="font-bold text-slate-800">{companyAccount.accountName || 'Not Set'}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">Amount to Pay</p>
                                    <p className="font-bold text-green-600 text-2xl">₦3,000</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                            <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <span>ℹ️</span>
                                Instructions
                            </h4>
                            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                <li>Transfer exactly ₦3,000 to the account above</li>
                                <li>Take a screenshot or photo of the payment receipt</li>
                                <li>Upload the proof of payment in the next step</li>
                                <li>Wait for admin approval (usually within 24 hours)</li>
                            </ol>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleUploadProof} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Payment Proof</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-slate-300 focus:border-brand-green outline-none transition-all bg-white/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-green file:text-white file:cursor-pointer hover:file:bg-emerald-600"
                                />
                                <p className="text-xs text-slate-500 mt-1">Accepted: JPG, PNG, GIF (Max 5MB)</p>
                                {paymentProof && (
                                    <p className="text-sm text-green-600 mt-2">✓ {paymentProof.name} selected</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={uploadLoading || !paymentProof}
                                className="w-full py-3 bg-gradient-to-r from-brand-green to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                            >
                                {uploadLoading ? 'Uploading...' : 'Submit Payment Proof'}
                            </button>
                        </form>
                    </>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <>
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">✓</span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Registration Submitted!</h1>
                            <p className="text-slate-600 mb-6">Your payment proof has been uploaded successfully</p>

                            <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 mb-6 text-left">
                                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                                    <span>⏳</span>
                                    Pending Admin Approval
                                </h3>
                                <p className="text-sm text-amber-700 mb-3">
                                    Your registration is currently under review. An admin will verify your payment proof and approve your account.
                                </p>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">What happens next?</p>
                                    <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                                        <li>Admin reviews your payment proof</li>
                                        <li>Account is approved (usually within 24 hours)</li>
                                        <li>You'll receive a notification</li>
                                        <li>You can then login with your credentials</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                                <p className="text-sm text-slate-600 mb-2">Your Login Credentials:</p>
                                <p className="font-mono text-slate-800"><span className="font-bold">Username:</span> {formData.username}</p>
                                <p className="text-xs text-slate-500 mt-2">Please save these credentials for future login</p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-3 bg-gradient-to-r from-brand-green to-emerald-600 text-white rounded-lg font-bold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Go to Login Page
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Signup;
