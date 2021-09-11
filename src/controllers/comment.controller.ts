import { Request, Response } from 'express';
import { Types } from 'mongoose';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';
import { Comment } from '../models/comment';
import { addComment } from '../services/comments.service';

const createComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { comment, userId, userName, songId }: Comment = req.body;
        const newComment: Comment = { comment, userId, userName, songId };

        throwUnlessValidReq(req.body, ['songId', 'userId', 'comment']);

        // we won't await here - no need to await a success I think???
        addComment(newComment, res);

        handleSuccessResponse(res, { comment });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

export { createComment };
