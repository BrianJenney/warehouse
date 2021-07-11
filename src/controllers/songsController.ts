import { Request, Response } from 'express';
import { UploadedFiles } from '../interfaces/files';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';
import { S3 } from 'aws-sdk';
import fs from 'fs';
import { SongModel, Song } from '../models/song';

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const uploadSong = async (req: Request, res: Response): Promise<void> => {
    try {
        const { songTitle, artistId, genre } = req.body;
        console.log(req.body);
        console.log(req.files);
        const songFile = req.files.song as UploadedFiles;
        const songArtFile = req.files.songArt as UploadedFiles;

        throwUnlessValidReq(req.body, ['songTitle', 'artistId', 'genre']);

        const artData: any = await fs.readFileSync(songArtFile.tempFilePath);

        const songArtData: S3.ManagedUpload.SendData = await s3
            .upload({
                Bucket: 'slapbucket',
                Key: `${songTitle}.jpg`,
                Body: artData,
            })
            .promise();

        fs.readFile(songFile.tempFilePath, (err: Error, data: Buffer) => {
            s3.upload(
                {
                    Bucket: 'slapbucket',
                    Key: `${songTitle}.mp3`,
                    Body: data,
                },
                (err: Error, songData: S3.ManagedUpload.SendData): void => {
                    if (err) throw err;

                    console.log(
                        `File uploaded successfully at ${songData.Location}`
                    );

                    SongModel.create({
                        title: songTitle,
                        userId: artistId,
                        url: songData.Location,
                        songCoverUrl: songArtData.Location,
                        genre,
                    }).then((song: Song) => {
                        res.send({ songTitle, song });
                    });
                }
            );
        });
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

        handleSuccessResponse(res, { data: { songId: songId } });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const getAllSongs = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        throwUnlessValidReq(req.params, ['userId']);
        res.send({ userId });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

export { uploadSong, getAllSongs, removeSong };
