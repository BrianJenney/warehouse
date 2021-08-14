import { Request, Response } from 'express';
import { UserModel, User } from '../models/user';
import { addJwt, createJwt } from '../services/user.service';
import { sendMail } from '../services/mailer.service';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';
import jwt from 'jsonwebtoken';
import { TokenInterface } from '../interfaces/token';
import { updateUser } from './user.controller';
import bcrypt from 'bcryptjs';

const passwordChangeRequest = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['email']);
        const { email } = req.body;

        const user: User = await UserModel.findOne({ email });

        if (!user) {
            handleErrorResponse({ message: 'User does not exist' }, res);
        }

        const token: string = createJwt({ email: user.email });
        sendMail({
            to: email,
            message: `Please follow this link to change your password: http://localhost:3000/passwordreset/${token}`,
            from: 'slapjunky',
            subject: 'Reset Your Password',
        });
        handleSuccessResponse(res, { token });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['password', 'token']);
        const { password, token } = req.body;

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        ) as TokenInterface;

        const user: User = await UserModel.findOne({ email: decoded.email });
        if (!user || !user.email) {
            handleErrorResponse({ message: 'Link expired' }, res);
        }

        const hashedPassword: string = bcrypt.hashSync(
            password,
            bcrypt.genSaltSync(8)
        );

        const updatedUser: User = await UserModel.findByIdAndUpdate(
            { _id: user._id },
            { password: hashedPassword },
            { new: true }
        );

        console.log(updatedUser, decoded);

        addJwt({ email: updatedUser.email }, res);
        handleSuccessResponse(res, { user: updateUser });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

export { passwordChangeRequest, changePassword };