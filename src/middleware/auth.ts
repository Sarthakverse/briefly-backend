import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import prisma from '../lib/prisma';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided'));
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token) as { userId: string; email: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return next(new UnauthorizedError('User not found'));
    (req as any).user = user;
    next();
  } catch (err) {
    return next(new UnauthorizedError('Invalid token'));
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
}