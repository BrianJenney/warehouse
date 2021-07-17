import { Request, Response, NextFunction } from 'express';
import { throwUnlessValidReq, handleErrorResponse } from '../apiHelpers';
import { UserModel } from '../models/user';

const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { name, email, userType } = req.body;
        throwUnlessValidReq(req.body, ['user', 'email', 'userType']);
        const newUser = UserModel.create({ name, email, userType });
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
        const { name, email, userType } = req.body;
        throwUnlessValidReq(req.body, ['user', 'email', 'userType']);
        const newUser = UserModel.create({ name, email, userType });
        res.send({ user: newUser });
    } catch (e) {
        handleErrorResponse(e, res);
        next();
    }
};

export { createUser, updateUser };
