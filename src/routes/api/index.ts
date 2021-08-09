import { Router } from 'express';
import songRoutes from './songsRoutes';
import userRoutes from './userRoutes';
import searchRoutes from './searchRoutes';
import imageAuthRoutes from './imageAuthRoutes';

const router = Router();

router.use('/songs', songRoutes);
router.use('/user', userRoutes);
router.use('/search', searchRoutes);
router.use('/image', imageAuthRoutes);

export default router;
