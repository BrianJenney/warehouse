import { Router } from 'express';
import { getArtist } from '../../controllers/artist.controller';

const router = Router();

router.route('/id').post(getArtist);

export default router;
