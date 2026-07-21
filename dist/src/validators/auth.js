"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email format'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters'),
    name: zod_1.z.string().trim().min(1, 'Name is required'),
    department: zod_1.z.string().trim().min(1, 'Department is required'),
    designation: zod_1.z.string().trim().min(1, 'Designation is required'),
    phone: zod_1.z.string().trim().min(1, 'Phone number is required'),
    officeLocation: zod_1.z
        .string()
        .trim()
        .min(1, 'Office location is required'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email format'),
});
exports.resetPasswordSchema = zod_1.z.object({
    email: zod_1.z.email('Invalid email format'),
    otp: zod_1.z
        .string()
        .length(6, 'OTP must be exactly 6 digits')
        .regex(/^\d+$/, 'OTP must contain only digits'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters'),
});
