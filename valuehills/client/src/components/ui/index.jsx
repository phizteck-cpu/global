import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import DataTable from './DataTable';

// Button Component
const Button = React.forwardRef(
  ({ className, variant = 'primary', size = 'default', isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-background hover:bg-primary-light',
      secondary: 'bg-secondary text-white hover:bg-secondary/80',
      danger: 'bg-red-500 text-white hover:bg-red-600',
      ghost: 'bg-transparent text-white hover:bg-white/10',
      outline: 'border border-white/20 text-white hover:bg-white/10',
    };

    const sizes = {
      small: 'px-3 py-1.5 text-xs',
      default: 'px-4 py-2.5 text-sm',
      large: 'px-6 py-3.5 text-base',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
        disabled={disabled || isLoading}
        className={clsx(
          'font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

// Input Component
const Input = React.forwardRef(
  ({ label, error, icon, className, type = 'text', ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-medium text-noble-gray ml-1 block">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">{icon}</div>
          )}
          <input
            ref={ref}
            type={type}
            className={clsx(
              'w-full rounded-xl bg-surface border text-white placeholder-white/30 focus:ring-4 outline-none transition-all',
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                : 'border-white/10 focus:border-primary/50 focus:ring-primary/10',
              icon ? 'pl-11 pr-4 py-3' : 'px-4 py-3',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs ml-1 flex items-center gap-1"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// Card Component
const Card = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={clsx('glass-panel p-6 rounded-2xl border border-white/5', className)}
    >
      {children}
    </motion.div>
  );
};

// Badge Component
const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-white/10 text-white',
    primary: 'bg-primary/20 text-primary',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

// Spinner Component
const Spinner = ({ size = 'default', className }) => {
  const sizes = {
    small: 'w-4 h-4 border-2',
    default: 'w-6 h-6 border-2',
    large: 'w-10 h-10 border-4',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={clsx(
        'border-primary border-t-transparent rounded-full',
        sizes[size],
        className
      )}
    />
  );
};

// Skeleton Component
const Skeleton = ({ className, variant = 'text', width, height }) => {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    rectangularLarge: 'rounded-xl',
  };

  return (
    <div
      className={clsx('bg-white/10 animate-pulse', variants[variant], className)}
      style={{ width: width || '100%', height: height || 'auto' }}
    />
  );
};

// Alert Component
const Alert = ({ children, variant = 'info', className, title }) => {
  const variants = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    danger: 'bg-red-500/10 border-red-500/30 text-red-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className={clsx('p-4 rounded-xl border', variants[variant], className)}
    >
      {title && <p className="font-bold mb-1">{title}</p>}
      {children}
    </motion.div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'default' }) => {
  if (!isOpen) return null;

  const sizes = {
    small: 'max-w-sm',
    default: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={clsx(
          'w-full glass-panel rounded-3xl border border-white/10 shadow-2xl',
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold font-heading">{title}</h2>
          </div>
        )}
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};

// Empty State Component
const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-white/30">{icon}</div>}
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-noble-gray text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};

export {
  Button,
  Input,
  Card,
  Badge,
  Spinner,
  Skeleton,
  Alert,
  Modal,
  EmptyState,
  DataTable,
};
