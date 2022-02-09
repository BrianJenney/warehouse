import { Router } from 'express';
import {
    addConfig,
    getAllConfigs,
    getConfig,
    saveDraft,
    toggleActiveState,
} from '../../controllers/styles.controller';
import { addSubscriptionInfo } from '../../apiHelpers';

const router = Router();

router.route('/savedraft').post(addSubscriptionInfo, saveDraft);
router.route('/addconfig').post(addSubscriptionInfo, addConfig);
router.route('/getconfig').get(addSubscriptionInfo, getConfig);
router.route('/getallconfigs').get(getAllConfigs);
router.route('/updateActiveState').post(toggleActiveState);

export default router;
