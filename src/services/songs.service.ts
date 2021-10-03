import { UploadedFiles } from '../interfaces/files';
import { SongModel, Song } from '../models/song';
import { Types } from 'mongoose';
import { S3 } from 'aws-sdk';
import fs from 'fs';

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const getSongsByMethod = async ({
    region,
    artistId,
    songId,
    method,
    genre,
    city,
    state,
    page,
}: Record<string, any>): Promise<Song[]> => {
    const queryMap: Record<string, any> = {
        cityState: {
            city: { $regex: city, $options: 'i' },
            state: { $regex: state, $options: 'i' },
        },
        region: {
            region,
        },
        userId: {
            artistId,
        },
        songId: {
            _id: new Types.ObjectId(songId),
        },
        genre: {
            genre,
        },
    };

    const query: Record<string, unknown> = queryMap[method];

    const songsResponse: Song[] = await SongModel.aggregate([
        {
            $match: {
                ...query,
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'artist',
            },
        },
        { $limit: 10 * page },
        { $skip: 10 * (page - 1) },
    ]);

    return songsResponse;
};

/* 
    We are no longer using S3 to upload songs - but will keep these methods in case we would like to switch
    at some point - currently using imagekit at the time of writing this 10/02/2021
*/

// DEPRECATED FOR NOW
const uploadSongData = async (
    file: UploadedFiles,
    s3Bucket: 'slapbucket',
    fileName: string,
    extension: string
): Promise<S3.ManagedUpload.SendData> => {
    const fileBuffer: Buffer = await fs.readFileSync(file.tempFilePath);

    const s3Data: S3.ManagedUpload.SendData = await s3
        .upload({
            Bucket: s3Bucket,
            Key: `${fileName}.${extension}`,
            Body: fileBuffer,
        })
        .promise();

    return s3Data;
};

const deletefromBucket = async (
    s3Bucket: 'slapbucket',
    fileName: string
): Promise<boolean> => {
    try {
        await s3
            .deleteObject({
                Bucket: s3Bucket,
                Key: fileName,
            })
            .promise();
        return true;
    } catch (ex) {
        return false;
    }
};

export { getSongsByMethod, uploadSongData, deletefromBucket };
