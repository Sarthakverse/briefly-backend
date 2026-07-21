"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_service_1 = require("../services/auth.service");
exports.authController = {
    signup: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.authService.signup(req.body);
        res.status(201).json(result);
    }),
    login: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, password } = req.body;
        const result = await auth_service_1.authService.login(email, password);
        res.json(result);
    }),
    refreshToken: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { refreshToken } = req.body;
        const result = await auth_service_1.authService.refreshToken(refreshToken);
        res.json(result);
    }),
    forgotPassword: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email } = req.body;
        await auth_service_1.authService.forgotPassword(email);
        res.json({ message: 'If the email is registered, an OTP has been sent.' });
    }),
    resetPassword: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email, otp, newPassword } = req.body;
        await auth_service_1.authService.resetPassword(email, otp, newPassword);
        res.json({ message: 'Password reset successful' });
    }),
    getProfile: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = req.user;
        const profile = await auth_service_1.authService.getProfile(user.id);
        res.json(profile);
    }),
    logout: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = req.user;
        await auth_service_1.authService.logout(user.id);
        res.json({ message: 'Logged out' });
    }),
};
