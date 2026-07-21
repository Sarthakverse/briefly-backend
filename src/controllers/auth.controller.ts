import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authService } from '../services/auth.service';

export const authController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.json({ message: 'If the email is registered, an OTP has been sent.' });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    await authService.resetPassword(email, otp, newPassword);
    res.json({ message: 'Password reset successful' });
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const profile = await authService.getProfile(user.id);
    res.json(profile);
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    await authService.logout(user.id);
    res.json({ message: 'Logged out' });
  }),
};