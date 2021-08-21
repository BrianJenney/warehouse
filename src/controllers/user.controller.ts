import { Request, Response, NextFunction } from 'express';
import { addJwt } from '../services/user.service';
import { throwUnlessValidReq, handleErrorResponse } from '../apiHelpers';
import { UserModel, User } from '../models/user';

const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['email', 'userType', 'password']);
        const {
            firstName,
            lastName,
            email,
            userType,
            avatar,
            city,
            state,
            password,
            bio,
            socialMedia = [],
        } = req.body;

        const newUser = await UserModel.create({
            firstName,
            lastName,
            email,
            userType,
            avatar,
            city,
            state,
            password,
            bio,
            socialMedia,
        });

        addJwt({ email }, res);
        res.send({ user: newUser });
    } catch (e) {
        handleErrorResponse(e, res);
        next();
    }
};

const updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['userId', 'email', 'userType']);
        const { userId } = req.body;

        const nonFalsyVals: Record<string, unknown> = [
            'firstName',
            'lastName',
            'email',
            'userName',
            'artistName',
            'avatar',
            'city',
            'state',
            'userType',
            'bio',
            'socialMedia',
        ].reduce((acc: Record<string, unknown>, val: string) => {
            if (req.body[val] && req.body !== '') {
                acc[val] = req.body[val];
            }
            return acc;
        }, {});

        const newUser: User = await UserModel.findByIdAndUpdate(
            { _id: userId },
            { ...nonFalsyVals },
            { new: true }
        );

        addJwt({ email: newUser.email }, res);
        res.send({ user: newUser });
    } catch (e) {
        handleErrorResponse(e, res);
        next();
    }
};

const signIn = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['email', 'password']);
        const { password, email } = req.body;

        const currentUser: User = await UserModel.findOne({ email }).select(
            '+password'
        );

        if (!currentUser.isValidPassword(password, currentUser.password)) {
            throw new Error('Invalid Password');
        }

        addJwt({ email: currentUser.email }, res);
        res.send({ user: currentUser });
    } catch (e) {
        handleErrorResponse(e, res);
        next();
    }
};

export { createUser, updateUser, signIn };
