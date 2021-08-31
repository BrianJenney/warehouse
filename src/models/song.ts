import { Schema, model, Types } from 'mongoose';
import { User } from '../models/user';

interface Song {
    userId: string;
    artistName: string;
    albumId: string;
    title: string;
    genre: string;
    region: string;
    city: string;
    state: string;
    likes: string[];
    dislikes: string[];
    plays: string[];
    url: string;
    songCoverUrl: string;
    user?: User[];
}

const schema = new Schema<Song>({
    userId: { type: Types.ObjectId, required: true, ref: 'user' },
    artistName: { type: String },
    title: { type: String, required: true },
    albumId: { type: String },
    url: { type: String },
    songCoverUrl: { type: String },
    plays: [{ type: String }],
    region: { type: String },
    city: { type: String },
    state: { type: String },
    createdAt: {
        type: Date,
        default: new Date(),
    },
    genre: {
        type: String,
        enum: ['rap', 'randb', 'alternative', 'pop', 'other', 'trap'],
    },
    likes: [{ type: String }],
});

schema.index({ name: 'text', artistName: 'text' });
schema.index({ name: 'text', title: 'text' });

const SongModel = model<Song>('Song', schema);

export { SongModel, Song };
