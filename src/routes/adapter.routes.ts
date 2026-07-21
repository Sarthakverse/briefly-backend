import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { adapterController } from '../controllers/adapter.controller';

const router = Router();

router.get('/', authenticate, adapterController.getAll);
router.get('/recent', authenticate, adapterController.getRecent); 
router.post('/', authenticate, requireAdmin, adapterController.create);
router.put('/:id', authenticate, requireAdmin, adapterController.update);
router.delete('/:id', authenticate, requireAdmin, adapterController.delete);

export default router;