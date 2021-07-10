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
}

const schema = new Schema<Song>({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    albumId: { type: String },
    url: { type: String },
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

export const SongModel = model<Song>('Song', schema);
