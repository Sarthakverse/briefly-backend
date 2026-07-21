import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { meetingController } from '../controllers/meeting.controller';

const router = Router();

router.get('/recent', authenticate, meetingController.getRecent);
router.get('/enhancements/:enhancementId', authenticate, meetingController.getByEnhancement);
router.get('/:id', authenticate, meetingController.getById);
router.post('/', authenticate, meetingController.create);
router.put('/:id', authenticate, requireAdmin, meetingController.update);
router.delete('/:id', authenticate, requireAdmin, meetingController.delete);
router.post('/:id/reprocess', authenticate, requireAdmin, meetingController.reprocess);
router.get('/:id/llm-input', authenticate, meetingController.getLLMInput);


export default router;