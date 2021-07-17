import { Router } from 'express';
import { createUser, updateUser } from '../../controllers/user.controller';

const router = Router();

router.route('/create').post(createUser);
router.route('/update').post(updateUser);

export default router;
