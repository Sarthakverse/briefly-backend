import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/jwt';
import prisma from '../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name, department, designation, phone, officeLocation } = req.body;

    // Basic validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const validDesignations = ['Automation', 'Dev', 'QA', 'Support', 'Other'];
    if (designation && !validDesignations.includes(designation)) {
      return res.status(400).json({ message: 'Invalid designation' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        department: department || null,
        designation: designation || null,
        phone: phone || null,
        officeLocation: officeLocation || null,
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