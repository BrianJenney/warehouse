import { Response } from 'express';

const throwUnlessValidReq = (
    reqBody: any,
    keysToCheck: string[]
): string | boolean => {
    const reqBodyKeys = Object.keys(reqBody);
    const missingKeys = keysToCheck.filter((key) => !reqBodyKeys.includes(key));
    if (missingKeys.length) {
        throw new Error(`Request must include ${missingKeys}`);
    }

    return true;
};

const handleErrorResponse = (error: any, res: Response): void => {
    res.status(500).send({ error: error.message || 'Oops an error occurred' });
};

interface ResponseObject {
    message: string;
    data: any;
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

export { throwUnlessValidReq, handleErrorResponse, handleSuccessResponse };
