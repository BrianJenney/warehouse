import { Router } from 'express';
import {
    addConfig,
    getAllConfigs,
    getConfig,
    saveDraft,
    toggleActiveState,
} from '../../controllers/styles.controller';

const router = Router();

router.route('/savedraft').post(saveDraft);
router.route('/addconfig').post(addConfig);
router.route('/getconfig').get(getConfig);
router.route('/getallconfigs').get(getAllConfigs);
router.route('/updateActiveState').post(toggleActiveState);

export default router;
