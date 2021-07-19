import { Request, Response } from 'express';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';
import { SongModel, Song } from '../models/song';
import { getSongsByMethod } from '../services/songs.service';

const uploadSong = async (req: Request, res: Response): Promise<void> => {
    try {
        const { songTitle, artistId, genre, artistName, artUrl, songUrl } =
            req.body;

        throwUnlessValidReq(req.body, [
            'songTitle',
            'artistId',
            'genre',
            'artistName',
            'artUrl',
            'songUrl',
        ]);

        const song = await SongModel.create({
            title: songTitle,
            userId: artistId,
            url: songUrl,
            region: 'Bay Area',
            artistName,
            songCoverUrl: artUrl,
            genre,
        });

        handleSuccessResponse(res, { songTitle, song });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const removeSong = async (req: Request, res: Response): Promise<void> => {
    try {
        const { songId } = req.body;

        throwUnlessValidReq(req.body, ['songId']);
        await SongModel.remove({ _id: songId });
        // TODO: remove from s3 bucket

        handleSuccessResponse(res, { data: { songId } });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const getSongsBy = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, method, region, songId, genre } = req.body;
        throwUnlessValidReq(req.body, ['method']);

        const songsResponse: Song[] = await getSongsByMethod({
            region,
            artistId: userId,
            songId,
            method,
            genre,
        });

        handleSuccessResponse(res, { data: songsResponse });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

export { uploadSong, getSongsBy, removeSong };
