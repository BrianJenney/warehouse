import { Schema, model } from 'mongoose';

interface Song {
    userId: string;
    albumId: string;
    title: string;
    genre: string;
    region: string;
    likes: string[];
    dislikes: string[];
    plays: number;
    url: string;
    songCoverUrl: string;
}

const schema = new Schema<Song>({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    albumId: { type: String },
    url: { type: String },
    songCoverUrl: { type: String },
    plays: { type: Number },
    region: { type: String },
    genre: {
        type: String,
        enum: ['rap', 'randb', 'alternative', 'pop', 'other', 'trap'],
    },
    likes: [
        {
            userId: { type: String },
        },
    ],
});

const SongModel = model<Song>('Song', schema);

export { SongModel, Song };
