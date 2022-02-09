import { Request, Response } from 'express';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';
import cryptoRandomString from 'crypto-random-string';
import { PspxUserModel, PspxUser } from '../models/pspxUser';
import { PspxSpaceModel, PspxSpace } from '../models/pspxSpace';

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

const addUserToExistingSpace = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        throwUnlessValidReq(req.body, ['email', 'spaceId']);

        const { email, spaceId, space } = req.body;

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

        handleSuccessResponse(res, { newUser });
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

export { addNewUser, addUserToExistingSpace, getUserInfo, removeUser };
