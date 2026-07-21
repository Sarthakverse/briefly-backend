import { Router } from 'express';
import authRoutes from './auth.routes';
import adapterRoutes from './adapter.routes';
import releaseRoutes from './release.routes';
import enhancementRoutes from './enhancement.routes';
import meetingRoutes from './meeting.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/adapters', adapterRoutes);
router.use('/releases', releaseRoutes);
router.use('/enhancements', enhancementRoutes);
router.use('/meetings', meetingRoutes);

export default router;