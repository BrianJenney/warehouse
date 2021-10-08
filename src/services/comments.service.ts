import { Comment, CommentModel } from '../models/comment';

export const addComment = async (comment: Comment): Promise<void> => {
    CommentModel.create(comment);
};
