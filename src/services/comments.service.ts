import { Response } from 'express';
import { Comment, CommentModel } from '../models/comment';

export const addComment = async (
    comment: Comment,
    res: Response
): Promise<void> => {
    CommentModel.create(comment);
};
