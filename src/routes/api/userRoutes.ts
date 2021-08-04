import { Router } from 'express';
import {
    createUser,
    updateUser,
    signIn,
} from '../../controllers/user.controller';

const router = Router();

router.route('/create').post(createUser);
router.route('/update').post(updateUser);
router.route('/signin').post(signIn);

export default router;
