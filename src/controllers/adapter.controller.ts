import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { adapterService } from '../services/adapter.service';

export const adapterController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const adapters = await adapterService.getAll();
    res.json(adapters);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Adapter name is required' });
      return;
    }
    const adapter = await adapterService.create(name);
    res.status(201).json(adapter);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const name = Array.isArray(req.body.name) ? req.body.name[0] : req.body.name;
    if (!name) {
      res.status(400).json({ message: 'Adapter name is required' });
      return;
    }
    const adapter = await adapterService.update(id, name);
    res.json(adapter);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await adapterService.delete(id);
    res.json({ message: 'Adapter deleted' });
  }),
    
  getRecent: asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const adapters = await adapterService.getRecent(limit);
    res.json(adapters);
  }),
};