import { Router } from 'express';
import {
    addConfig,
    getConfig,
    saveDraft,
} from '../../controllers/styles.controller';

const router = Router();

router.route('/savedraft').post(saveDraft);
router.route('/addconfig').post(addConfig);
router.route('/getconfig').get(getConfig);

export default router;
