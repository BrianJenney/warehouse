import { Router } from 'express';
import { createUser, updateUser } from '../../controllers/userController';

const router = Router();

router.route('/create').post(createUser);
router.route('/update').post(updateUser);

export default router;
