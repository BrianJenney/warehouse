import { Router } from 'express';
import { createComment } from '../../controllers/comment.controller';

const router = Router();

router.route('/addComment').post(createComment);

export default router;
