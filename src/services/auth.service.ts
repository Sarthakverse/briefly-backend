import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateAccessToken, generateRefreshToken,hashToken } from '../lib/jwt';
import { BadRequestError, UnauthorizedError, ConflictError, NotFoundError } from '../utils/AppError';
import { DESIGNATIONS } from '../constants';
import { Prisma } from '@prisma/client';
import { sendOtpEmail } from '../lib/email';

// Helper to create refresh token row and return the plain token
async function createRefreshTokenForUser(userId: string): Promise<string> {
  const plainToken = generateRefreshToken();
  const tokenHash = hashToken(plainToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });
  return plainToken;
}

export const authService = {
  async signup(data: {
  email: string;
  password: string;
  name: string;
  department: string;
  designation: string;
  phone: string;
  officeLocation: string;
}) {
  if (
    !data.email ||
    !data.password ||
    !data.name ||
    !data.department ||
    !data.designation ||
    !data.phone ||
    !data.officeLocation
  ) {
    throw new BadRequestError('All fields are required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new BadRequestError('Invalid email format');
  }

  if (data.password.length < 8) {
    throw new BadRequestError('Password must be at least 8 characters');
  }

  if (!DESIGNATIONS.includes(data.designation)) {
    throw new BadRequestError('Invalid designation');
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  let user;

  try {
    user = await prisma.user.create({
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
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = (error.meta as any)?.target as string[] | undefined;

      if (target?.includes('email')) {
        throw new ConflictError('Email already registered');
      }

      if (target?.includes('phone')) {
        throw new ConflictError('Phone number already registered');
      }
    }

    throw error;
  }

  const refreshToken = await createRefreshTokenForUser(user.id);
  const accessToken = generateAccessToken(user.id, user.email);

  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
},

  async login(email: string, password: string) {
    if (!email || !password) throw new BadRequestError('Email and password are required');
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    // Create new refresh token
    const refreshToken = await createRefreshTokenForUser(user.id);
    const accessToken = generateAccessToken(user.id, user.email);
    const { passwordHash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  async refreshToken(oldRefreshToken: string) {
    const tokenHash = hashToken(oldRefreshToken);
    const storedToken = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        // expired – clean up
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Rotate: delete old, create new
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    const newRefreshToken = await createRefreshTokenForUser(storedToken.userId);

    const user = await prisma.user.findUnique({ where: { id: storedToken.userId } });
    if (!user) throw new UnauthorizedError('User not found');

    const accessToken = generateAccessToken(user.id, user.email);
    const { passwordHash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken: newRefreshToken };
  },

  async forgotPassword(email: string) {
    if (!email) throw new BadRequestError('Email is required');
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // silently ignore
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { otp, expiresAt },
      create: { userId: user.id, otp, expiresAt },
    });
    // TODO: Send email via Resend (we'll implement next)
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    await sendOtpEmail(email, otp);
  },

  async resetPassword(email: string, otp: string, newPassword: string) {
    if (!email || !otp || !newPassword) throw new BadRequestError('Email, OTP, and new password are required');
    if (newPassword.length < 8) throw new BadRequestError('Password must be at least 8 characters');
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestError('Invalid request');
    const tokenRecord = await prisma.passwordResetToken.findUnique({ where: { userId: user.id } });
    if (!tokenRecord || tokenRecord.otp !== otp || tokenRecord.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired OTP');
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await prisma.passwordResetToken.delete({ where: { userId: user.id } });
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async logout(userId: string) {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  },
};