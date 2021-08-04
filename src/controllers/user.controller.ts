import { Request, Response, NextFunction } from 'express';
import { addJwt } from '../services/user.service';
import { throwUnlessValidReq, handleErrorResponse } from '../apiHelpers';
import { UserModel, User } from '../models/user';

const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    throwUnlessValidReq(req.body, ['email', 'userType', 'password']);
    try {
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
    throwUnlessValidReq(req.body, ['userId', 'email', 'userType']);
    try {
        const {
            firstName,
            lastName,
            email,
            userType,
            avatar,
            city,
            state,
            userId,
        } = req.body;

        const currentUser: User = await UserModel.findById(userId);

        const updatedVals: User = {
            ...currentUser,
            firstName,
            lastName,
            email,
            userType,
            avatar,
            city,
            state,
        };

        const newUser: User = await UserModel.create(updatedVals);
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
    throwUnlessValidReq(req.body, ['email', 'password']);
    try {
        const { password, email } = req.body;

        const currentUser: User = await UserModel.findOne({ email });

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
