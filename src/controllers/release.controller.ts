import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { releaseService } from '../services/release.service';

export const releaseController = {
  getByAdapter: asyncHandler(async (req: Request, res: Response) => {
    const adapterId = Array.isArray(req.params.adapterId) ? req.params.adapterId[0] : req.params.adapterId;
    const releases = await releaseService.getByAdapter(adapterId);
    res.json(releases);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const release = await releaseService.getById(id);
    res.json(release);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const adapterId = Array.isArray(req.params.adapterId) ? req.params.adapterId[0] : req.params.adapterId;
    const { name, summary } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Release name is required' });
      return;
    }
    const release = await releaseService.create(adapterId, name, summary);
    res.status(201).json(release);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, summary } = req.body;
    const release = await releaseService.update(id, { name, summary });
    res.json(release);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await releaseService.delete(id);
    res.json({ message: 'Release deleted' });
  }),
    
  getRecent: asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const releases = await releaseService.getRecent(limit);
    res.json(releases);
  }),
};