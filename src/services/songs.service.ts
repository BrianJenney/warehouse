import { UploadedFiles } from '../interfaces/files';
import { SongModel, Song } from '../models/song';
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
}: Record<string, string>): Promise<Song[]> => {
    const queryMap: Record<string, unknown> = {
        region: {
            region,
        },
        userId: {
            artistId,
        },
        song: {
            id: songId,
        },
        genre: {
            genre,
        },
    };

    const query = queryMap[method];
    const songsResponse: Song[] = await SongModel.find(query);
    return songsResponse;
};

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
