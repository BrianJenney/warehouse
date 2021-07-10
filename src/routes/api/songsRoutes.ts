import { Router } from 'express';
import { uploadSong, getAllSongs } from '../../controllers/songsController';

const router = Router();

router.route('/upload').post(uploadSong);
router.route('/all/:userId').get(getAllSongs);

export default router;
