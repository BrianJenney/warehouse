import { Router, raw } from 'express';
import {
    handlePayments,
    createCheckOutSession,
} from '../../controllers/payment.controller';

const router = Router();

router
    .route('/handlepayments')
    .post(raw({ type: 'application/json' }), handlePayments);
router.route('/startcheckout').post(createCheckOutSession);

export default router;
