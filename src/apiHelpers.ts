import { Request, Response, NextFunction } from 'express';
import { PspxSpaceModel, PspxSpace } from './models/pspxSpace';
import { Types } from 'mongoose';
import { createClient } from 'redis';
import { StyleConfig } from './models/styleConfig';
import { config } from 'dotenv';
config();

let client: any;

(async () => {
    client = createClient({
        url: `redis://:${process.env.REDIS_PASSWORD}@usw1-glorious-wombat-32784.upstash.io:32784`,
    });

    client.on('error', (err: string) => console.log('Redis Client Error', err));

    await client.connect();
})();

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

const addSubscriptionInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // we accept both spaceid and spaceId 🙄 and the id can be a string or a true id so we must check all scenarios
    if (req.body && (req.body.spaceId || req.body.spaceid)) {
        const validId: string = req.body.spaceId || req.body.spaceid;

        const isObjectId: boolean = Types.ObjectId.isValid(validId);

        const space: PspxSpace = isObjectId
            ? await PspxSpaceModel.findById(validId)
            : await PspxSpaceModel.findOne({
                  spaceId: validId,
              });

        req.body = Object.assign({}, req.body, {
            space,
        });
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

const cacheMe = {
    getValue: async (key: string): Promise<StyleConfig> => {
        console.log(`Retrieving ${key} from cache`);
        const val: string = await client.get(key);
        if (!val) {
            console.log(`${key} not found in cache`);
            return;
        }
        return JSON.parse(val);
    },
    setValue: async (key: string, val: any): Promise<void> => {
        console.log(`Setting ${key} in cache`);
        await client.set(key, val);
    },

    removevalue: async (key: string): Promise<void> => {
        console.log(`Removing ${key} from cache`);
        await client.remove(key);
    },
};

export {
    throwUnlessValidReq,
    handleErrorResponse,
    handleSuccessResponse,
    addSubscriptionInfo,
    cacheMe,
};
