import jwt from 'jsonwebtoken';
import { Response } from 'express';

const addJwt = (payload: Record<string, unknown>, res: Response): Response => {
    //create the access token with the shorter lifespan
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        algorithm: 'HS256',
        expiresIn: process.env.ACCESS_TOKEN_LIFE,
    });

    res.cookie('jwt', accessToken, { secure: true, httpOnly: true });
    return res;
};

export { addJwt };
