import { Request, Response } from 'express';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';
import { StyleConfigModel, StyleConfig } from '../models/styleConfig';
import {
    StyleConfigVersion,
    StyleConfigVersionModel,
} from '../models/styleConfigVersion';
import cryptoRandomString from 'crypto-random-string';
import { PspxUserModel, PspxUser } from '../models/pspxUser';
import { PspxSpaceModel, PspxSpace } from '../models/pspxSpace';

const _hasSubsciption = async (spaceId: string): Promise<boolean> => {
    const space: PspxSpace = await PspxSpaceModel.findById(spaceId);
    return space.hasSubscription;
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

    await PspxUserModel.findByIdAndUpdate(userId, { spaceId }, { new: true });
};

const _removeUserFromSpace = async ({
    userId,
    spaceId,
}: {
    userId: string;
    spaceId: string;
}): Promise<void> => {
    await PspxSpaceModel.findByIdAndUpdate(
        spaceId,
        { $pull: { users: userId } },
        { new: true }
    );

    await PspxUserModel.findByIdAndUpdate(
        userId,
        { spaceId: null },
        { new: true }
    );
};

// move older version to the other schema

const _moveOldConfigAndStoreVersion = async (
    config: StyleConfig
): Promise<void> => {
    await StyleConfigVersionModel.create({
        _id: config._id,
        spaceid: config.spaceid,
        styles: config.styles,
        isActive: config.isActive,
        version: config.version || 1,
        createdAt: config.createdAt,
    });

    await StyleConfigModel.remove({ _id: config._id });
};

const getConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.query, ['spaceid']);

        const { isPreview, spaceid } = req.query;

        const isDraft: boolean =
            (isPreview as string).toLocaleLowerCase() === 'true' ? true : false;

        // return early if no subscription
        const pspxSpace: PspxSpace = await PspxSpaceModel.findOne({
            spaceId: spaceid as string,
        });

        if (!pspxSpace || !pspxSpace.hasSubscription) {
            handleSuccessResponse(res, { styleConfig: null });
        }

        const styleConfig: StyleConfig = await StyleConfigModel.findOne({
            draft: isDraft,
            spaceid: spaceid as string,
            isActive: isDraft ? false : true,
        });

        handleSuccessResponse(res, { styleConfig });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const getAllConfigs = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.query, ['spaceid']);

        const { spaceid } = req.query;

        const configs: StyleConfig[] = await StyleConfigModel.find({
            spaceid: spaceid as string,
        });

        const versions: StyleConfigVersion[] =
            await StyleConfigVersionModel.find({
                spaceid: spaceid as string,
            });

        handleSuccessResponse(res, { configs, versions });
    } catch (e) {
        handleErrorResponse(e, res);
    }
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
                version: oldStyle ? (oldStyle.version || 1) + 1 : 1,
                draft: false,
            },
        });

        await _moveOldConfigAndStoreVersion(oldStyle);

        handleSuccessResponse(res, {});
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const addConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['spaceid', 'styles']);

        const { isPreview, spaceid, styles, isActive } = req.body;

        const oldStyle: StyleConfig = await StyleConfigModel.findOne({
            spaceid,
            draft: false,
        });

        const oldPreview: StyleConfig = await StyleConfigModel.findOne({
            spaceid,
            draft: true,
        });

        if (oldStyle && !isPreview) {
            await _moveOldConfigAndStoreVersion(oldStyle);
        }

        if (oldPreview && isPreview) {
            await StyleConfigModel.findByIdAndUpdate(oldPreview._id, {
                styles,
                isActive,
            });

            handleSuccessResponse(res, {});
            return; // early return so we do not create multiple drafts
        }

        const newConfig: StyleConfig = await StyleConfigModel.create({
            spaceid,
            styles,
            draft: isPreview,
            version: oldStyle ? (oldStyle.version || 1) + 1 : 1,
            isActive,
        });

        handleSuccessResponse(res, { newConfig });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const toggleActiveState = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['configId', 'isActive']);
        const { configId, isActive } = req.body;

        await StyleConfigModel.findByIdAndUpdate(configId, {
            $set: {
                isActive,
            },
        });

        handleSuccessResponse(res, {});
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const addUserToExistingSpace = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['email', 'spaceId']);

        const { email, spaceId, space } = req.body;

        console.log({ space });

        if (!space.hasSubscription) {
            return handleErrorResponse(
                { message: 'You need a subscription to add users' },
                res
            );
        }

        const newUser: PspxUser = await PspxUserModel.create({
            email,
        });

        await _addUserToSpace({ userId: newUser._id, spaceId });

        handleSuccessResponse(res, { newUser });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const addNewUser = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['email', 'name', 'userid']);

        const { email, name, userid } = req.body;

        // check if user already exists and just assign userid from auth0
        const currentUser: PspxUser = await PspxUserModel.findOne({ email });

        if (currentUser) {
            await PspxUserModel.findByIdAndUpdate(
                currentUser._id,
                { userid, name },
                { new: true }
            );
            handleSuccessResponse(res, {});
            return;
        }

        const apiKey: string = cryptoRandomString(6);

        const newUser = await PspxUserModel.create({
            email,
            userid,
            name,
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

const removeUser = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['spaceId', 'userid']);

        const { spaceId, userid } = req.body;

        await _removeUserFromSpace({ userId: userid, spaceId });

        handleSuccessResponse(res, {});
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

const getUserInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        throwUnlessValidReq(req.query, ['userid']);

        const { userid } = req.query;

        const user: PspxUser = await PspxUserModel.findOne({
            userid: userid as string,
        });

        const userSpace: PspxSpace = await PspxSpaceModel.findById(
            user.spaceId
        );

        const allUsers: PspxUser[] = await Promise.all(
            userSpace.users.map((id) => PspxUserModel.findById(id))
        );

        handleSuccessResponse(res, {
            space: userSpace,
            user,
            spaceUsers: allUsers.filter(Boolean),
        });
    } catch (e) {
        handleErrorResponse(e, res);
    }
};

export {
    getAllConfigs,
    getConfig,
    addConfig,
    saveDraft,
    addNewUser,
    addUserToExistingSpace,
    toggleActiveState,
    getUserInfo,
    removeUser,
};
