import { Router } from 'express';
import {
    getArtist,
    artistByRegionCount,
} from '../../controllers/artist.controller';

const router = Router();

router.route('/id').post(getArtist);
router.route('/regionalData').get(artistByRegionCount);

export default router;
