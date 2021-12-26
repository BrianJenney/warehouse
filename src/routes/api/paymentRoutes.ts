import { Router } from 'express';
import { handlePayments } from '../../controllers/payment.controller';

const router = Router();

router.route('/handlepayments').post(handlePayments);

export default router;
