import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { releaseController } from '../controllers/release.controller';

const router = Router();

router.get('/recent', authenticate, releaseController.getRecent);   
router.get('/adapters/:adapterId/releases', authenticate, releaseController.getByAdapter);
router.get('/:id', authenticate, releaseController.getById);
router.post('/adapters/:adapterId/releases', authenticate, requireAdmin, releaseController.create);
router.put('/:id', authenticate, requireAdmin, releaseController.update);
router.delete('/:id', authenticate, requireAdmin, releaseController.delete);

export default router;