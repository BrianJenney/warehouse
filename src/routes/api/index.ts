import { Router } from 'express';
import songRoutes from './songsRoutes';
import userRoutes from './userRoutes';

const router = Router();

router.use('/songs', songRoutes);
router.use('/user', userRoutes);

export default router;
