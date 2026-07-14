import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/releases/:releaseId/enhancements
router.get('/releases/:releaseId/enhancements', authenticate, async (req, res) => {
  try {
    const releaseId = Array.isArray(req.params.releaseId) ? req.params.releaseId[0] : req.params.releaseId;
    const enhancements = await prisma.enhancement.findMany({
      where: { releaseId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(enhancements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/releases/:releaseId/enhancements - admin
router.post('/releases/:releaseId/enhancements', authenticate, requireAdmin, async (req, res) => {
  try {
    const releaseId = Array.isArray(req.params.releaseId) ? req.params.releaseId[0] : req.params.releaseId;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Enhancement name is required' });

    const release = await prisma.release.findUnique({ where: { id: releaseId } });
    if (!release) return res.status(404).json({ message: 'Release not found' });

    const existing = await prisma.enhancement.findUnique({
      where: { name_releaseId: { name, releaseId } },
    });
    if (existing) return res.status(409).json({ message: 'Enhancement already exists in this release' });

    const enhancement = await prisma.enhancement.create({
      data: { name, releaseId: releaseId as string },
    });
    res.status(201).json(enhancement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/enhancements/:id - admin
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name } = req.body;
    const enhancement = await prisma.enhancement.update({
      where: { id },
      data: { name },
    });
    res.json(enhancement);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Enhancement not found' });
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/enhancements/:id - admin
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.enhancement.delete({ where: { id } });
    res.json({ message: 'Enhancement deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Enhancement not found' });
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;