import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Login form schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Signup form schema
export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username too long').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Profile update schema
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
});

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Withdrawal schema
export const withdrawalSchema = z.object({
  amount: z.number().min(100, 'Minimum withdrawal is ₦100'),
  pin: z.string().min(4, 'PIN must be 4 digits').max(4, 'PIN must be 4 digits'),
});

// Contribution schema
export const contributionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
});

// Custom hook for login form
export const useLoginForm = () => {
  return useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });
};

// Custom hook for signup form
export const useSignupForm = () => {
  return useForm({
    resolver: zodResolver(signupSchema),
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
};

// Custom hook for profile form
export const useProfileForm = () => {
  return useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      bankName: '',
      accountNumber: '',
      accountName: '',
    },
    mode: 'onBlur',
  });
};

// Custom hook for change password form
export const useChangePasswordForm = () => {
  return useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });
};

// Custom hook for withdrawal form
export const useWithdrawalForm = () => {
  return useForm({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: '',
      pin: '',
    },
    mode: 'onBlur',
  });
};

export default {
  loginSchema,
  signupSchema,
  profileSchema,
  changePasswordSchema,
  withdrawalSchema,
  contributionSchema,
};
