import { Request, Response, NextFunction } from 'express';
import { PspxSpaceModel, PspxSpace } from './models/pspxSpace';
import jwt from 'jsonwebtoken';
import { TokenInterface } from './interfaces/token';

const throwUnlessValidReq = (
    reqBody: Record<string, unknown>,
    keysToCheck: string[]
): string | boolean => {
    const reqBodyKeys = Object.keys(reqBody);
    const missingKeys = keysToCheck.filter((key) => !reqBodyKeys.includes(key));
    if (missingKeys.length) {
        throw new Error(`Request must include ${missingKeys}`);
    }

    return true;
};

const verifyAuthentication = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authToken = req.headers['authorization'];
    if (typeof authToken !== 'undefined') {
        const bearer = authToken.split(' ');
        const bearerToken = bearer[1];

        try {
            jwt.verify(
                bearerToken,
                process.env.ACCESS_TOKEN_SECRET
            ) as TokenInterface;
            next();
        } catch (e) {
            res.sendStatus(403);
        }
    }
    res.sendStatus(403);
};

const addSubscriptionInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (req.body && req.body.spaceId) {
        const space: PspxSpace = await PspxSpaceModel.findById(
            req.body.spaceId
        );

        req.body = Object.assign({}, req.body, { space });
    }
    next();
};

const handleErrorResponse = (
    error: Record<string, unknown>,
    res: Response
): void => {
    res.status(500).send({ error: error.message || 'Oops an error occurred' });
};

interface ResponseObject {
    message: string;
    data: Record<string, unknown>;
}

const handleSuccessResponse = (
    res: Response,
    responseObj: ResponseObject | Record<string, unknown>
): void => {
    res.status(200).send({
        data: {},
        message: 'Success',
        ...responseObj,
    });
};

export {
    throwUnlessValidReq,
    handleErrorResponse,
    handleSuccessResponse,
    verifyAuthentication,
    addSubscriptionInfo,
};
