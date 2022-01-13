import { Router } from 'express';
import {
    addConfig,
    getAllConfigs,
    getConfig,
    saveDraft,
    toggleActiveState,
    addNewUser,
    addUserToExistingSpace,
    removeUser,
    getUserInfo,
} from '../../controllers/styles.controller';
import { addSubscriptionInfo } from '../../apiHelpers';

const router = Router();

router.route('/savedraft').post(addSubscriptionInfo, saveDraft);
router.route('/addconfig').post(addSubscriptionInfo, addConfig);
router.route('/getconfig').get(addSubscriptionInfo, getConfig);
router.route('/getallconfigs').get(getAllConfigs);
router.route('/adduser').post(addSubscriptionInfo, addNewUser);
router
    .route('/addusertospace')
    .post(addSubscriptionInfo, addUserToExistingSpace);
router.route('/removeuserfromspace').post(addSubscriptionInfo, removeUser);
router.route('/updateActiveState').post(toggleActiveState);
router.route('/getuser').get(getUserInfo);

export default router;
