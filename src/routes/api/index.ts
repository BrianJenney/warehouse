import { Router } from 'express';
import songRoutes from './songsRoutes';

const router = Router();

router.use('/songs', songRoutes);

export default router;
