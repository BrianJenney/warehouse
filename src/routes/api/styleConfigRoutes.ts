import { Router } from 'express';
import {
    addConfig,
    getAllConfigs,
    getConfig,
    saveDraft,
    toggleActiveState,
    addNewUser,
    addUserToExistingSpace,
    getUserInfo,
} from '../../controllers/styles.controller';

const router = Router();

router.route('/savedraft').post(saveDraft);
router.route('/addconfig').post(addConfig);
router.route('/getconfig').get(getConfig);
router.route('/getallconfigs').get(getAllConfigs);
router.route('/adduser').post(addNewUser);
router.route('/addusertospace').post(addUserToExistingSpace);
router.route('/updateActiveState').post(toggleActiveState);
router.route('/getuser').get(getUserInfo);

export default router;
