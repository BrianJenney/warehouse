import { Router } from 'express';
import stylesRoutes from './styleConfigRoutes';
import paymentsRoutes from './paymentRoutes';
import pspxUserRoutes from './pspxUserRoutes';

const router = Router();

router.use('/styles', stylesRoutes);
router.use('/payments', paymentsRoutes);
router.use('/user', pspxUserRoutes);

export default router;
