import { Request, Response } from 'express';
import { Types } from 'mongoose';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';
import { SongModel, Song } from '../models/song';
import { deletefromBucket, getSongsByMethod } from '../services/songs.service';

const uploadSong = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            songTitle,
            artistId,
            genre,
            artistName,
            artUrl,
            songUrl,
            city,
            state,
        } = req.body;

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
            userId: new Types.ObjectId(artistId),
            url: songUrl,
            city,
            state,
            artistName,
            songCoverUrl: artUrl,
            genre,
        });

        handleSuccessResponse(res, { songTitle, song });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const likeSong = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['songId', 'userId']);
        const { songId, userId, removeLike = false } = req.body;

        const updateObj: Record<string, unknown> = removeLike
            ? { $pull: { likes: userId } }
            : {
                  $addToSet: { likes: userId },
              };
        const song: Song = await SongModel.findByIdAndUpdate(
            songId,
            updateObj,
            { new: true }
        );
        handleSuccessResponse(res, { song });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const addToPlays = async (req: Request, res: Response): Promise<void> => {
    const { songId, userId } = req.body;
    throwUnlessValidReq(req.body, ['songId', 'userId']);

    const updateObj: Record<string, unknown> = {
        $addToSet: { plays: userId },
    };
    try {
        const song: Song = await SongModel.findByIdAndUpdate(songId, updateObj);
        handleSuccessResponse(res, { song });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const removeSong = async (req: Request, res: Response): Promise<void> => {
    try {
        const { songId } = req.body;

        throwUnlessValidReq(req.body, ['songId']);
        const songToDelete: Song = await SongModel.findById(songId);
        await SongModel.remove({ _id: songId });
        await deletefromBucket('slapbucket', songToDelete.url);
        handleSuccessResponse(res, { data: { songId } });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const getSongsBy = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            userId,
            method,
            cityState = '',
            region,
            songId,
            genre,
            page = 1,
        } = req.body;
        throwUnlessValidReq(req.body, ['method']);

        const [city, state] = cityState.split(',');
        const songsResponse: Song[] = await getSongsByMethod({
            region,
            city,
            state,
            artistId: userId,
            songId,
            method,
            genre,
            page,
        });

        handleSuccessResponse(res, { data: songsResponse });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

export { uploadSong, getSongsBy, removeSong, likeSong, addToPlays };
