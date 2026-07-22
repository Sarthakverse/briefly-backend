import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { favoriteController } from '../controllers/favorite.controller';

const router = Router();
router.get('/check', authenticate, favoriteController.check);  
router.get('/', authenticate, favoriteController.list);
router.post('/toggle', authenticate, favoriteController.toggle);

export default router;