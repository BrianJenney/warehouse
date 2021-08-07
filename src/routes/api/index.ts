import { Router } from 'express';
import songRoutes from './songsRoutes';
import userRoutes from './userRoutes';
import searchRoutes from './searchRoutes';

const router = Router();

router.use('/songs', songRoutes);
router.use('/user', userRoutes);
router.use('/search', searchRoutes);

export default router;
