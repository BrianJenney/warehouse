import { Router } from 'express';
import songRoutes from './songsRoutes';
import userRoutes from './userRoutes';
import searchRoutes from './searchRoutes';
import imageAuthRoutes from './imageAuthRoutes';
import passwordRoutes from './passwordChangeRoutes';

const router = Router();

router.use('/songs', songRoutes);
router.use('/user', userRoutes);
router.use('/search', searchRoutes);
router.use('/image', imageAuthRoutes);
router.use('/password', passwordRoutes);

export default router;
