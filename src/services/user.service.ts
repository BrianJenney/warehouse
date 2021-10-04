import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { UserModel, User } from '../models/user';

const getUserAndSongs = async (
    user: User,
    query: Record<string, any>
): Promise<User> => {
    try {
        if (user.userType === 'artist') {
            const userWithSongs: User[] = await UserModel.aggregate([
                {
                    $match: {
                        ...query,
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

            return userWithSongs[0];
        }

        const userWithNoSongs: User = await UserModel.findOne({
            ...query,
        }).lean();

        return userWithNoSongs;
    } catch (ex) {
        throw new Error(ex);
    }
};

const createJwt = (payload: Record<string, unknown>): string => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: 'HS256',
        expiresIn: process.env.ACCESS_TOKEN_LIFE,
    });
    return accessToken;
};

const addJwt = (payload: Record<string, unknown>, res: Response): Response => {
    res.cookie('jwt', createJwt(payload), { secure: true, httpOnly: true });
    return res;
};

export { addJwt, createJwt, getUserAndSongs };
