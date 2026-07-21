import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';

export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, config.jwtSecret, { expiresIn: '15m' });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyAccessToken(token: string): { userId: string; email: string } {
  return jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
}

// Hash function for refresh tokens (SHA-256)
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}