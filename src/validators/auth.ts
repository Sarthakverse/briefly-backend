import { z } from 'zod';

export const signupSchema = z.object({
  email: z.email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  name: z.string().trim().min(1, 'Name is required'),
  department: z.string().trim().min(1, 'Department is required'),
  designation: z.string().trim().min(1, 'Designation is required'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  officeLocation: z
    .string()
    .trim()
    .min(1, 'Office location is required'),
});

export const loginSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  email: z.email('Invalid email format'),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only digits'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});