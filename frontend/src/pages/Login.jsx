import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsLoading(true);

    try {
      const result = await login(data.username, data.password);

      if (result.success) {
        const adminRoles = ['ADMIN', 'SUPERADMIN', 'FINANCE_ADMIN', 'OPS_ADMIN', 'SUPPORT_ADMIN'];
        if (adminRoles.includes(result.role)) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setServerError(result.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4"
          >
            <Shield className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-4xl font-bold font-heading mb-2">
            <span className="text-white">Value</span>
            <span className="text-primary">Hills</span>
          </h1>
          <p className="text-noble-gray">Welcome back to your cooperative hub.</p>
        </div>

        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-red-500/10 text-red-300 text-sm rounded-xl border border-red-500/30 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-noble-gray ml-1">
              Username
            </label>
            <div className="relative group">
              <input
                type="text"
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' },
                })}
                className={`w-full px-5 py-4 rounded-xl bg-surface border ${
                  errors.username ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary/50'
                } text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all`}
                placeholder="Enter your username"
                disabled={isLoading}
              />
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1 ml-1 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.username.message}
                </motion.p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-noble-gray ml-1">
              Password
            </label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 1, message: 'Password is required' },
                })}
                className={`w-full px-5 py-4 rounded-xl bg-surface border ${
                  errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary/50'
                } text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all pr-12`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1 ml-1 flex items-center gap-1"
                >
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </motion.p>
              )}
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-noble-gray hover:text-primary transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting || isLoading}
            whileHover={{ scale: isSubmitting || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting || isLoading ? 1 : 0.98 }}
            className="w-full py-4 bg-primary text-background rounded-xl font-bold uppercase tracking-widest text-xs hover:shadow-glow transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting || isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
                />
                Authenticating...
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Access Dashboard
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-noble-gray space-y-2 flex flex-col">
          <span>
            Not a member yet?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:text-white transition-colors">
              Join the Network
            </Link>
          </span>
          <span className="text-xs pt-2 border-t border-white/10 italic">
            Are you staff?{' '}
            <Link to="/admin/login" className="text-secondary font-bold hover:underline">
              Institutional Access
            </Link>
          </span>
        </p>

        {/* Password Requirements Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
        >
          <p className="text-xs text-noble-gray mb-2">Security Tip:</p>
          <ul className="text-xs text-white/60 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-primary" />
              Use your registered username to log in
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-primary" />
              Password must be at least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3 text-primary" />
              Contact support if account is locked
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
