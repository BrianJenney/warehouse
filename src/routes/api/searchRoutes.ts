import { Router } from 'express';
import { searchSongs } from '../../controllers/search.controller';

const router = Router();

router.route('/search').post(searchSongs);

export default router;
