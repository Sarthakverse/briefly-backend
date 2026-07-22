import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { workspaceController } from '../controllers/workspace.controller';

const router = Router();

router.get('/', authenticate, workspaceController.list);
router.post('/', authenticate, workspaceController.upload);
router.delete('/all', authenticate, workspaceController.deleteAll);  
router.get('/:id', authenticate, workspaceController.getById);
router.put('/:id', authenticate, workspaceController.update);
router.delete('/:id', authenticate, workspaceController.delete);
router.post('/:id/reprocess', authenticate, workspaceController.reprocess);
router.get('/:id/llm-input', authenticate, workspaceController.getLLMInput);

export default router;