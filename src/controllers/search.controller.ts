import { Request, Response } from 'express';
import { SongModel, Song } from '../models/song';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';

const searchSongs = async (req: Request, res: Response): Promise<void> => {
    throwUnlessValidReq(req.body, ['query']);
    try {
        const { query } = req.body;

        const songResponse: Song[] = await SongModel.find({
            title: { $regex: query, $options: 'i' },
        });

        const artistResponse: Song[] = await SongModel.find({
            artistName: { $regex: query, $options: 'i' },
        });

        handleSuccessResponse(res, {
            data: [...songResponse, ...artistResponse],
        });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

export { searchSongs };
