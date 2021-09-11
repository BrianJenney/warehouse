import { Schema, model, Types } from 'mongoose';

interface Comment {
    userId: string;
    userName: string;
    songId: string;
    comment: string;
    createdAt?: string;
}

const schema = new Schema<Comment>({
    userId: { type: Types.ObjectId, required: true, ref: 'user' },
    songId: { type: Types.ObjectId, required: true },
    userName: { type: String },
    comment: { type: String },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

const CommentModel = model<Comment>('Comment', schema);

export { CommentModel, Comment };
