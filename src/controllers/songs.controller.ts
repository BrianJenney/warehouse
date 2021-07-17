import { Request, Response } from 'express';
import { UploadedFiles } from '../interfaces/files';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';
import { S3 } from 'aws-sdk';
import { SongModel, Song } from '../models/song';
import { getSongsByMethod, uploadSongData } from '../services/songs.service';

const uploadSong = async (req: Request, res: Response): Promise<void> => {
    try {
        const { songTitle, artistId, genre, artistName } = req.body;

        const songFile = req.files.song as UploadedFiles;
        const songArtFile = req.files.songArt as UploadedFiles;

        throwUnlessValidReq(req.body, [
            'songTitle',
            'artistId',
            'genre',
            'artistName',
        ]);

        const artData: S3.ManagedUpload.SendData = await uploadSongData(
            songArtFile,
            'slapbucket',
            songTitle,
            'jpg'
        );

        const songData: S3.ManagedUpload.SendData = await uploadSongData(
            songFile,
            'slapbucket',
            songTitle,
            'mp3'
        );

        const song = await SongModel.create({
            title: songTitle,
            userId: artistId,
            url: songData.Location,
            region: 'Bay Area',
            artistName,
            songCoverUrl: artData.Location,
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
