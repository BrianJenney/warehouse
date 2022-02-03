import { PspxUser, PspxUserModel } from '../models/pspxUser';
import { PspxSpace, PspxSpaceModel } from '../models/pspxSpace';
import { addSubscriptionToSpace } from './payment.service';

describe('payment.service', () => {
    let user1: PspxUser, user2: PspxUser;

    beforeEach(async () => {
        await PspxSpaceModel.deleteMany({});
        await PspxUserModel.deleteMany({});

        user1 = await PspxUserModel.create({
            name: 'Bob Bobert',
            email: 'hotguy@hotmail.net',
            userid: 'userid123',
        });

        user2 = await PspxUserModel.create({
            name: 'Dan Danbury',
            email: 'coldguy@hotmail.net',
            userid: 'userid456',
        });
    });

    it('adds a user to space', async () => {
        const unPaidSpace: PspxSpace = await PspxSpaceModel.create({
            spaceId: '456def',
            billingId: null,
            hasSubscription: false,
            users: [user1._id, user2._id],
        });

        await addSubscriptionToSpace('456def', 'newBillingId', true);

        const updatedUser1 = await PspxUserModel.findById(user1._id);
        const updatedUser2 = await PspxUserModel.findById(user2._id);
        const updatedSpace = await PspxSpaceModel.findById(unPaidSpace._id);
        expect(updatedUser1.isAdmin).toBe(true);
        expect(updatedUser2.isAdmin).toBe(false);
        expect(updatedSpace.hasSubscription).toBe(true);
        expect(updatedSpace.billingId).toBe('newBillingId');
    });
});
