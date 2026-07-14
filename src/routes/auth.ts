import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateToken } from '../lib/jwt';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

const VALID_DESIGNATIONS = [
  'Trainee (TR)',
  'Associate (AC)',
  'Associate Specialist (ASP)',
  'Specialist (SP)',
  'Senior Specialist (SS)',
  'Lead (LD)',
  'Associate Manager (AMG)',
  'Manager (MG)',
  'Senior Manager (SM)',
  'Director (DR)',
  'Senior Director (SD)',
  'Vice President (VP)',
  'Software Engineer (SWE)',
  'Senior Software Engineer (SSWE)',
];

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, department, designation, phone, officeLocation } = req.body;

    // Mandatory fields validation
    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!name) missingFields.push('name');
    if (!department) missingFields.push('department');
    if (!designation) missingFields.push('designation');
    if (!phone) missingFields.push('phone');
    if (!officeLocation) missingFields.push('officeLocation');
    if (missingFields.length) {
      return res.status(400).json({ message: `Required fields missing: ${missingFields.join(', ')}` });
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(400).json({ message: 'Invalid email format' });

    // Password strength (same as frontend)
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    // Optional: add more server-side checks if desired

    // Designation validation
    if (!VALID_DESIGNATIONS.includes(designation)) {
      return res.status(400).json({ message: 'Invalid designation' });
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Check existing phone
    const existingPhone = await prisma.user.findFirst({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ message: 'Phone number already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        department,
        designation,
        phone,
        officeLocation,
      },
    });

    const token = generateToken(user.id, user.email);
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
        officeLocation: user.officeLocation,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.email);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
        officeLocation: user.officeLocation,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email is registered, an OTP has been sent.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP – use a simple table or in-memory store. For demo, we'll store in a new table.
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: { otp, expiresAt },
      create: { userId: user.id, otp, expiresAt },
    });

    // In production, send via email/SMS. For now, log to console (or return OTP for testing).
    console.log(`OTP for ${email}: ${otp}`);
    // You could send email using nodemailer or SMS via Twilio.

    res.json({ message: 'If the email is registered, an OTP has been sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid request' });

    const tokenRecord = await prisma.passwordResetToken.findUnique({ where: { userId: user.id } });
    if (!tokenRecord || tokenRecord.otp !== otp || tokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    await prisma.passwordResetToken.delete({ where: { userId: user.id } });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/me (protected)
router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    department: user.department,
    designation: user.designation,
    phone: user.phone,
    officeLocation: user.officeLocation,
    role: user.role,
  });
});

export default router;