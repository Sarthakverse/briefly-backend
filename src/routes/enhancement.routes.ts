import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { enhancementController } from '../controllers/enhancement.controller';

const router = Router();

router.get('/recent', authenticate, enhancementController.getRecent);
router.get('/releases/:releaseId/enhancements', authenticate, enhancementController.getByRelease);
router.post('/releases/:releaseId/enhancements', authenticate, requireAdmin, enhancementController.create);
router.put('/:id', authenticate, requireAdmin, enhancementController.update);
router.delete('/:id', authenticate, requireAdmin, enhancementController.delete);

export default router;