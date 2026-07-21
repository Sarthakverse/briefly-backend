import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { enhancementService } from '../services/enhancement.service';

export const enhancementController = {
  getByRelease: asyncHandler(async (req: Request, res: Response) => {
    const releaseId = Array.isArray(req.params.releaseId) ? req.params.releaseId[0] : req.params.releaseId;
    const enhancements = await enhancementService.getByRelease(releaseId);
    res.json(enhancements);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const releaseId = Array.isArray(req.params.releaseId) ? req.params.releaseId[0] : req.params.releaseId;
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Enhancement name is required' });
      return;
    }
    const enhancement = await enhancementService.create(releaseId, name);
    res.status(201).json(enhancement);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Enhancement name is required' });
      return;
    }
    const enhancement = await enhancementService.update(id, name);
    res.json(enhancement);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await enhancementService.delete(id);
    res.json({ message: 'Enhancement deleted' });
  }),
    
  getRecent: asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const enhancements = await enhancementService.getRecent(limit);
    res.json(enhancements);
  }),
};