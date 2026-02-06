import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />

      <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold font-heading mb-2">
            <span className="text-white">Value</span>
            <span className="text-primary">Hills</span>
          </h1>
          <p className="text-noble-gray">Welcome back to your cooperative hub.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 text-red-300 text-sm rounded-xl border border-red-500/30 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-300 rounded-full" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-noble-gray ml-1">Email or Username</label>
            <div className="group relative">
              <input
                type="text"
                required
                className="w-full px-5 py-4 rounded-xl bg-surface border border-white/10 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                placeholder="name@example.com or username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-noble-gray ml-1">Password</label>
            <div className="group relative">
              <input
                type="password"
                required
                className="w-full px-5 py-4 rounded-xl bg-surface border border-white/10 text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 focus:border-primary/50 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-background rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-glow hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Accessing Secure Vault...' : 'Access Dashboard'}
          </button>
        </form>

        <p className="mt-8 text-center text-noble-gray space-y-2 flex flex-col">
          <span>Not a member yet? <Link to="/signup" className="text-primary font-semibold hover:text-white transition-colors">Join the Network</Link></span>
          <span className="text-xs pt-2 border-t border-white/10 italic">Are you staff? <Link to="/admin/login" className="text-secondary font-bold hover:underline">Institutional Access</Link></span>
        </p>
      </div>
    </div>
  );
};

export default Login;

