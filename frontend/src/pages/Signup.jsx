import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../api';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const password = watch('password', '');

  const passwordStrength = React.useMemo(() => {
    const pwd = password;
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
    };
    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  }, [password]);

  const onSubmit = async (data) => {
    setServerError('');
    setIsLoading(true);

    try {
      const result = await api.post('/auth/signup', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        password: data.password,
      });

      const token = result.data.accessToken || result.data.token;
      if (token && result.data.user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        navigate('/dashboard');
      }
    } catch (error) {
      setServerError(
        error.response?.data?.message || error.response?.data?.error || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4"
          >
            <Shield className="w-8 h-8 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold font-heading mb-2">
            <span className="text-white">Join</span>
            <span className="text-primary"> ValueHills</span>
          </h1>
          <p className="text-noble-gray text-sm">Begin your cooperative journey today.</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-noble-gray ml-1">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  {...register('firstName', { required: 'First name is required', maxLength: 50 })}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-surface border ${
                    errors.firstName ? 'border-red-500/50' : 'border-white/10'
                  } text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all`}
                  placeholder="John"
                  disabled={isLoading}
                />
              </div>
              {errors.firstName && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.firstName.message}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-noble-gray ml-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required', maxLength: 50 })}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-surface border ${
                    errors.lastName ? 'border-red-500/50' : 'border-white/10'
                  } text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all`}
                  placeholder="Doe"
                  disabled={isLoading}
                />
              </div>
              {errors.lastName && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.lastName.message}
                </motion.p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-noble-gray ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
                })}
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-surface border ${
                  errors.email ? 'border-red-500/50' : 'border-white/10'
                } text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all`}
                placeholder="john@example.com"
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs ml-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email.message}
              </motion.p>
            )}
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-noble-gray ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'At least 3 characters' },
                  maxLength: { value: 20, message: 'Maximum 20 characters' },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Letters, numbers, underscores only' },
                })}
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-surface border ${
                  errors.username ? 'border-red-500/50' : 'border-white/10'
                } text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all`}
                placeholder="johndoe"
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs ml-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.username.message}
              </motion.p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-noble-gray ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                    message: 'Must include uppercase, lowercase, and number',
                  },
                })}
                className={`w-full pl-11 pr-12 py-3 rounded-xl bg-surface border ${
                  errors.password ? 'border-red-500/50' : 'border-white/10'
                } text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all`}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <motion.div
                      key={level}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength.score >= level
                          ? passwordStrength.score <= 2
                            ? 'bg-red-500'
                            : passwordStrength.score === 3
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-white/40">
                  <span className={passwordStrength.checks.length ? 'text-emerald-400' : ''}>8+ chars</span>
                  <span className={passwordStrength.checks.uppercase ? 'text-emerald-400' : ''}>Uppercase</span>
                  <span className={passwordStrength.checks.lowercase ? 'text-emerald-400' : ''}>Lowercase</span>
                  <span className={passwordStrength.checks.number ? 'text-emerald-400' : ''}>Number</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-noble-gray ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                className={`w-full pl-11 pr-4 py-3 rounded-xl bg-surface border ${
                  errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'
                } text-white placeholder-white/30 focus:ring-4 focus:ring-primary/10 outline-none transition-all`}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs ml-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-noble-gray text-center">
            By registering, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>

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
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-noble-gray text-sm">
          Already a member?{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-white transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
