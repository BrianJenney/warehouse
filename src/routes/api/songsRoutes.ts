import { Router } from 'express';
import {
    uploadSong,
    getSongsBy,
    likeSong,
} from '../../controllers/songs.controller';

const router = Router();

router.route('/upload').post(uploadSong);
router.route('/music').post(getSongsBy);
router.route('/like').post(likeSong);

export default router;
