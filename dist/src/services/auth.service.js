"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const jwt_1 = require("../lib/jwt");
const AppError_1 = require("../utils/AppError");
const constants_1 = require("../constants");
const client_1 = require("@prisma/client");
const email_1 = require("../lib/email");
// Helper to create refresh token row and return the plain token
async function createRefreshTokenForUser(userId) {
    const plainToken = (0, jwt_1.generateRefreshToken)();
    const tokenHash = (0, jwt_1.hashToken)(plainToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma_1.default.refreshToken.create({
        data: { tokenHash, userId, expiresAt },
    });
    return plainToken;
}
exports.authService = {
    async signup(data) {
        if (!data.email ||
            !data.password ||
            !data.name ||
            !data.department ||
            !data.designation ||
            !data.phone ||
            !data.officeLocation) {
            throw new AppError_1.BadRequestError('All fields are required');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new AppError_1.BadRequestError('Invalid email format');
        }
        if (data.password.length < 8) {
            throw new AppError_1.BadRequestError('Password must be at least 8 characters');
        }
        if (!constants_1.DESIGNATIONS.includes(data.designation)) {
            throw new AppError_1.BadRequestError('Invalid designation');
        }
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        let user;
        try {
            user = await prisma_1.default.user.create({
                data: {
                    email: data.email,
                    passwordHash,
                    name: data.name,
                    department: data.department,
                    designation: data.designation,
                    phone: data.phone,
                    officeLocation: data.officeLocation,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                const target = error.meta?.target;
                if (target?.includes('email')) {
                    throw new AppError_1.ConflictError('Email already registered');
                }
                if (target?.includes('phone')) {
                    throw new AppError_1.ConflictError('Phone number already registered');
                }
            }
            throw error;
        }
        const refreshToken = await createRefreshTokenForUser(user.id);
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.email);
        const { passwordHash: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken,
            refreshToken,
        };
    },
    async login(email, password) {
        if (!email || !password)
            throw new AppError_1.BadRequestError('Email and password are required');
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new AppError_1.UnauthorizedError('Invalid credentials');
        const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!valid)
            throw new AppError_1.UnauthorizedError('Invalid credentials');
        // Create new refresh token
        const refreshToken = await createRefreshTokenForUser(user.id);
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.email);
        const { passwordHash, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, accessToken, refreshToken };
    },
    async refreshToken(oldRefreshToken) {
        const tokenHash = (0, jwt_1.hashToken)(oldRefreshToken);
        const storedToken = await prisma_1.default.refreshToken.findUnique({ where: { tokenHash } });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            if (storedToken) {
                // expired – clean up
                await prisma_1.default.refreshToken.delete({ where: { id: storedToken.id } });
            }
            throw new AppError_1.UnauthorizedError('Invalid refresh token');
        }
        // Rotate: delete old, create new
        await prisma_1.default.refreshToken.delete({ where: { id: storedToken.id } });
        const newRefreshToken = await createRefreshTokenForUser(storedToken.userId);
        const user = await prisma_1.default.user.findUnique({ where: { id: storedToken.userId } });
        if (!user)
            throw new AppError_1.UnauthorizedError('User not found');
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.email);
        const { passwordHash, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, accessToken, refreshToken: newRefreshToken };
    },
    async forgotPassword(email) {
        if (!email)
            throw new AppError_1.BadRequestError('Email is required');
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            return; // silently ignore
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await prisma_1.default.passwordResetToken.upsert({
            where: { userId: user.id },
            update: { otp, expiresAt },
            create: { userId: user.id, otp, expiresAt },
        });
        // TODO: Send email via Resend (we'll implement next)
        console.log(`[DEV] OTP for ${email}: ${otp}`);
        await (0, email_1.sendOtpEmail)(email, otp);
    },
    async resetPassword(email, otp, newPassword) {
        if (!email || !otp || !newPassword)
            throw new AppError_1.BadRequestError('Email, OTP, and new password are required');
        if (newPassword.length < 8)
            throw new AppError_1.BadRequestError('Password must be at least 8 characters');
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user)
            throw new AppError_1.BadRequestError('Invalid request');
        const tokenRecord = await prisma_1.default.passwordResetToken.findUnique({ where: { userId: user.id } });
        if (!tokenRecord || tokenRecord.otp !== otp || tokenRecord.expiresAt < new Date()) {
            throw new AppError_1.BadRequestError('Invalid or expired OTP');
        }
        const passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.default.user.update({ where: { id: user.id }, data: { passwordHash } });
        await prisma_1.default.passwordResetToken.delete({ where: { userId: user.id } });
    },
    async getProfile(userId) {
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new AppError_1.NotFoundError('User not found');
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    },
    async logout(userId) {
        await prisma_1.default.refreshToken.deleteMany({ where: { userId } });
    },
};
