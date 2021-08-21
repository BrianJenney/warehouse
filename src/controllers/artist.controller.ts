import { Request, Response } from 'express';
import { Types } from 'mongoose';

import {
    throwUnlessValidReq,
    handleErrorResponse,
    handleSuccessResponse,
} from '../apiHelpers';
import { UserModel, User } from '../models/user';

const getArtist = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['artistId']);
        const { artistId } = req.body;

        const artistData: User[] = await UserModel.aggregate([
            {
                $match: { _id: new Types.ObjectId(artistId) },
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

        handleSuccessResponse(res, {
            data: [...artistData],
        });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

export { getArtist };
