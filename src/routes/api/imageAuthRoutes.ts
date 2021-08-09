import { Router } from 'express';
import { getImageAuth } from '../../controllers/imageAuth.controller';

const router = Router();

router.route('/imageauth').get(getImageAuth);

export default router;
