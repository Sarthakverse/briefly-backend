import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { favoriteService } from '../services/favorite.service';

export const favoriteController = {
  // POST /favorites/toggle
  // Body: { type: 'meeting' | 'workspace', id: string }
  toggle: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { type, id } = req.body;
    if (!type || !id) return res.status(400).json({ message: 'Missing type or id' });

    let result;
    if (type === 'meeting') {
      result = await favoriteService.toggle(userId, id, undefined);
    } else if (type === 'workspace') {
      result = await favoriteService.toggle(userId, undefined, id);
    } else {
      return res.status(400).json({ message: 'Invalid type. Must be "meeting" or "workspace".' });
    }
    res.json(result);
  }),

  // GET /favorites
  list: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const favorites = await favoriteService.listByUser(userId);
    res.json(favorites);
  }),

  // GET /favorites/check?type=meeting&id=xxx
  check: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { type, id } = req.query;
    if (!type || !id) return res.status(400).json({ message: 'Missing type or id' });
    let isFavorite = false;
    if (type === 'meeting') isFavorite = await favoriteService.isFavorite(userId, id as string, undefined);
    else if (type === 'workspace') isFavorite = await favoriteService.isFavorite(userId, undefined, id as string);
    else return res.status(400).json({ message: 'Invalid type' });
    res.json({ isFavorite });
  }),
};