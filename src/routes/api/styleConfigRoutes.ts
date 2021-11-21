import { Router } from 'express';
import { addConfig, getConfig } from '../../controllers/styles.controller';

const router = Router();

router.route('/addconfig').post(addConfig);
router.route('/getconfig').get(getConfig);

export default router;
