import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/adapters - all authenticated users
router.get('/', authenticate, async (req, res) => {
  try {
    const adapters = await prisma.adapter.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(adapters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/adapters - admin only
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Adapter name is required' });

    const existing = await prisma.adapter.findUnique({ where: { name } });
    if (existing) return res.status(409).json({ message: 'Adapter already exists' });

    const adapter = await prisma.adapter.create({ data: { name } });
    res.status(201).json(adapter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/adapters/:id - admin only
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name } = req.body;
    if (!id) return res.status(400).json({ message: 'Adapter id is required' });
    if (!name) return res.status(400).json({ message: 'Adapter name is required' });

    const adapter = await prisma.adapter.update({
      where: { id },
      data: { name },
    });
    res.json(adapter);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Adapter not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/adapters/:id - admin only
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ message: 'Adapter id is required' });
    await prisma.adapter.delete({ where: { id } });
    res.json({ message: 'Adapter deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Adapter not found' });
    }
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;