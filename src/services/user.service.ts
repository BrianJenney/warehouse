import jwt from 'jsonwebtoken';
import { Response } from 'express';

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

export { addJwt, createJwt };
