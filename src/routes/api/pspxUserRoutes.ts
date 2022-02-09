import { Router } from 'express';
import {
    addNewUser,
    addUserToExistingSpace,
    removeUser,
    getUserInfo,
} from '../../controllers/pspxUser.controller';
import { addSubscriptionInfo } from '../../apiHelpers';

const router = Router();

router.route('/adduser').post(addSubscriptionInfo, addNewUser);
router
    .route('/addusertospace')
    .post(addSubscriptionInfo, addUserToExistingSpace);
router.route('/removeuserfromspace').post(addSubscriptionInfo, removeUser);
router.route('/getuser').get(getUserInfo);

export default router;
