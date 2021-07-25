import { Router } from 'express';
import {
    uploadSong,
    getSongsBy,
    likeSong,
    addToPlays,
} from '../../controllers/songs.controller';

const router = Router();

router.route('/upload').post(uploadSong);
router.route('/music').post(getSongsBy);
router.route('/like').post(likeSong);
router.route('/plays').post(addToPlays);

export default router;
