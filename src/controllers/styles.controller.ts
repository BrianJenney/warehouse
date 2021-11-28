import { Request, Response } from 'express';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';
import { StyleConfigModel, StyleConfig } from '../models/styleConfig';
import { StyleConfigVersionModel } from '../models/styleConfigVersion';
import cryptoRandomString from 'crypto-random-string';
import { PspxUserModel, PspxUser } from '../models/pspxUser';
import { PspxSpaceModel, PspxSpace } from '../models/pspxSpace';

const getConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.query, ['spaceid']);

        const { isPreview, spaceid } = req.query;

        const isDraft: boolean =
            (isPreview as string).toLocaleLowerCase() === 'false'
                ? false
                : true;

        const styleConfig: StyleConfig = await StyleConfigModel.findOne({
            draft: isDraft,
            spaceid: spaceid as string,
        });

        handleSuccessResponse(res, { styleConfig });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

// move older version to the other schema
const moveOldConfigAndStoreVersion = async (
    config: StyleConfig
): Promise<void> => {
    await StyleConfigVersionModel.create({
        _id: config._id,
        spaceid: config.spaceid,
        styles: config.styles,
        version: config.version || 1,
    });

    await StyleConfigModel.deleteOne({ _id: config._id });
};

const saveDraft = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['spaceid', 'draftId']);
        const { spaceid, draftId } = req.body;

        const oldStyle: StyleConfig = await StyleConfigModel.findOne({
            spaceid,
            draft: false,
        });

        await StyleConfigModel.findByIdAndUpdate(draftId, {
            $set: {
                version: oldStyle.version + 1,
                draft: false,
            },
        });

        console.log(oldStyle, draftId);
        await moveOldConfigAndStoreVersion(oldStyle);

        handleSuccessResponse(res, {});
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const addConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['spaceid', 'styles']);

        const { isPreview, spaceid, styles } = req.body;

        const oldStyle: StyleConfig = await StyleConfigModel.findOne({
            spaceid,
            draft: false,
        });

        if (oldStyle && !isPreview) {
            await moveOldConfigAndStoreVersion(oldStyle);
        }

        await StyleConfigModel.create({
            spaceid,
            styles,
            draft: isPreview,
            version: oldStyle ? (oldStyle.version || 1) + 1 : 1,
        });

        handleSuccessResponse(res, {});
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const _addUserToSpace = async ({
    userId,
    spaceId,
}: {
    userId: string;
    spaceId: string;
}): Promise<void> => {
    await PspxSpaceModel.findByIdAndUpdate(
        spaceId,
        { $addToSet: { users: userId } },
        { new: true }
    );

    await PspxUserModel.findByIdAndUpdate(spaceId, { new: true });
};

const addUserToExistingSpace = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, [
            'email',
            'password',
            'firstName',
            'lastName',
            'spaceId',
        ]);

        const { email, password, firstName, lastName, spaceId } = req.body;

        const newUser: PspxUser = await PspxUserModel.create({
            email,
            password,
            firstName,
            lastName,
        });

        await _addUserToSpace({ userId: newUser._id, spaceId });

        handleSuccessResponse(res, {});
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const addNewUser = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, [
            'email',
            'password',
            'firstName',
            'lastName',
        ]);

        const { email, password, firstName, lastName } = req.body;

        const apiKey: string = cryptoRandomString(6);

        const newUser: PspxUser = await PspxUserModel.create({
            email,
            password,
            firstName,
            lastName,
        });

        const newSpace: PspxSpace = await PspxSpaceModel.create({
            spaceId: apiKey,
            accountType: 'free',
        });

        await _addUserToSpace({ userId: newUser._id, spaceId: newSpace._id });

        handleSuccessResponse(res, {});
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const signIn = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['email', 'password']);
        const { password, email } = req.body;

        const currentUser: PspxUser = await PspxUserModel.findOne({
            email,
        }).select('+password');

        if (!currentUser.isValidPassword(password, currentUser.password)) {
            throw new Error('Invalid Password');
        }

        res.send({ user: currentUser });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

export { getConfig, addConfig, saveDraft, addNewUser, addUserToExistingSpace };
