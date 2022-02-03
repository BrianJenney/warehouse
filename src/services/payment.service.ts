import { PspxUserModel } from '../models/pspxUser';
import { PspxSpace, PspxSpaceModel } from '../models/pspxSpace';

const _makeUserAdmin = async (userId: string): Promise<void> => {
    await PspxUserModel.findByIdAndUpdate(userId, {
        isAdmin: true,
    });
};

const addSubscriptionToSpace = async (
    spaceId: string,
    billingId: string,
    hasSubscription?: boolean | true
): Promise<void> => {
    const pspxSpace: PspxSpace = await PspxSpaceModel.findOne({
        spaceId,
    });

    await _makeUserAdmin(pspxSpace.users[0]);
    await PspxSpaceModel.findByIdAndUpdate(pspxSpace._id, {
        billingId,
        hasSubscription,
    });
};

export { addSubscriptionToSpace };
