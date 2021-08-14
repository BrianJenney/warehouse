import { Router } from 'express';
import {
    changePassword,
    passwordChangeRequest,
} from '../../controllers/passwordChange.controller';

const router = Router();

router.route('/changepassword').post(changePassword);
router.route('/requestchangepassword').post(passwordChangeRequest);

export default router;
