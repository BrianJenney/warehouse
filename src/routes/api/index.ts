import { Router } from 'express';
import songRoutes from './songsRoutes';
import userRoutes from './userRoutes';
import searchRoutes from './searchRoutes';
import imageAuthRoutes from './imageAuthRoutes';
import passwordRoutes from './passwordChangeRoutes';
import artistRoutes from './artistRoutes';

const router = Router();

router.use('/songs', songRoutes);
router.use('/user', userRoutes);
router.use('/search', searchRoutes);
router.use('/image', imageAuthRoutes);
router.use('/password', passwordRoutes);
router.use('/artist', artistRoutes);

export default router;
