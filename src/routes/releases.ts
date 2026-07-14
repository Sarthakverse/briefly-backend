import { Router, Request, Response } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/release/adapters/:adapterId/releases
router.get('/adapters/:adapterId/releases', authenticate, async (req, res) => {
  try {
    const adapterId = Array.isArray(req.params.adapterId) ? req.params.adapterId[0] : req.params.adapterId;
    const releases = await prisma.release.findMany({
      where: { adapterId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(releases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/releases/:id (single release with summary)
router.get('/releases/:id', authenticate, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) return res.status(400).json({ message: 'Release ID is required' });

    const release = await prisma.release.findUnique({
      where: { id },
      include: { _count: { select: { enhancements: true } } },
    });
    if (!release) return res.status(404).json({ message: 'Release not found' });
    res.json(release);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/adapters/:adapterId/releases - admin
router.post('/adapters/:adapterId/releases', authenticate, requireAdmin, async (req, res) => {
  try {
    const adapterId = Array.isArray(req.params.adapterId) ? req.params.adapterId[0] : req.params.adapterId;
    const { name, summary } = req.body;
    if (!name) return res.status(400).json({ message: 'Release name is required' });

    // Check adapter exists
    const adapter = await prisma.adapter.findUnique({ where: { id: adapterId } });
    if (!adapter) return res.status(404).json({ message: 'Adapter not found' });

    const existing = await prisma.release.findUnique({
      where: { name_adapterId: { name, adapterId } },
    });
    if (existing) return res.status(409).json({ message: 'Release already exists for this adapter' });

    const release = await prisma.release.create({
      data: { name, summary, adapterId },
    });
    res.status(201).json(release);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/releases/:id - admin
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, summary } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (summary !== undefined) data.summary = summary;
    const release = await prisma.release.update({ where: { id }, data });
    res.json(release);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Release not found' });
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/releases/:id - admin
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.release.delete({ where: { id } });
    res.json({ message: 'Release deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ message: 'Release not found' });
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;