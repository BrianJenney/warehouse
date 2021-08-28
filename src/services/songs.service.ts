import { UploadedFiles } from '../interfaces/files';
import { SongModel, Song } from '../models/song';
import { UserModel, User } from '../models/user';
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
}: Record<string, string>): Promise<Song[]> => {
    const queryMap: Record<string, any> = {
        cityState: {
            city,
            state,
        },
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

    const query: Record<string, unknown> = queryMap[method];

    if (method === 'cityState') {
        const songsByCityState: User[] = await UserModel.aggregate([
            {
                $match: {
                    city: { $regex: city, $options: 'i' },
                    state: { $regex: state, $options: 'i' },
                },
            },
            {
                $lookup: {
                    from: 'songs',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'songs',
                },
            },
            {
                $project: {
                    password: 0,
                },
            },
        ]);

        const formattedData: Song[] = songsByCityState.reduce((acc, val) => {
            const { songs, ...user } = val;
            const songData: Song[] = songs.map((song: Song) => {
                return { ...song, user: [user] };
            });

            return [...acc, ...songData];
        }, []);

        return formattedData;
    }

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
    ]);

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
