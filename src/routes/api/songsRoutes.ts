import { Router } from 'express';
import { uploadSong, getSongsBy } from '../../controllers/songs.controller';

const router = Router();

router.route('/upload').post(uploadSong);
router.route('/music').post(getSongsBy);

export default router;
