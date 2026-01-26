import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      const adminRoles = ['ADMIN', 'SUPERADMIN', 'FINANCE_ADMIN', 'OPS_ADMIN', 'SUPPORT_ADMIN'];
      if (adminRoles.includes(result.role)) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-noble-gradient px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-noble-green/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-noble-gold/10 rounded-full blur-[100px]" />

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-heading mb-2">
            <span className="text-noble-green">Value</span>
            <span className="text-noble-gold">Hills</span>
          </h1>
          <p className="text-slate-600">Welcome back to premium wealth management.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-200 text-sm rounded-xl border border-red-500/20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 ml-1">Email Address</label>
            <div className="group relative">
              <input
                type="email"
                required
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-noble-gold/50 focus:border-noble-gold/50 outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 ml-1">Password</label>
            <div className="group relative">
              <input
                type="password"
                required
                className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-noble-gold/50 focus:border-noble-gold/50 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-noble-green to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-900/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Accessing Secure Vault...' : 'Access Dashboard'}
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 space-y-2 flex flex-col">
          <span>Not a member yet? <Link to="/signup" className="text-noble-gold font-semibold hover:text-amber-400 transition-colors">Join the Network</Link></span>
          <span className="text-xs pt-2 border-t border-slate-100 italic">Are you staff? <Link to="/admin/login" className="text-noble-green font-bold hover:underline">Institutional Access</Link></span>
        </p>
      </div>
    </div>
  );
};

export default Login;
