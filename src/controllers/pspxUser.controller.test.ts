import { PspxUserModel } from '../models/pspxUser';
import { PspxSpaceModel } from '../models/pspxSpace';
import request from 'supertest';
import { app } from '../../server';

describe('users actions', () => {
    beforeEach(async () => {
        await PspxUserModel.deleteMany({});
        await PspxSpaceModel.deleteMany({});
    });

    it('adds a user to a space', async () => {
        const res = await request(app).post('/api/user/adduser').send({
            name: 'Bob Bobert',
            email: 'hotguy@hotmail.net',
            userid: 'userid123',
        });

        const user = await PspxUserModel.findOne({ userid: 'userid123' });
        const pspxSpace = await PspxSpaceModel.findById(user.spaceId);

        expect(pspxSpace.users.includes(user._id)).toBeTruthy();
        expect(res.body.newUser.email).toEqual('hotguy@hotmail.net');
    });

    it('updates a user with a user id if they have been already added to a space', async () => {
        await PspxUserModel.create({
            email: 'hotguy@hotmail.net',
        });

        await request(app).post('/api/user/adduser').send({
            name: 'Bob Bobert',
            email: 'hotguy@hotmail.net',
            userid: 'userid123',
        });

        const user = await PspxUserModel.findOne({
            email: 'hotguy@hotmail.net',
        });
        const pspxSpaces = await PspxSpaceModel.find({});

        expect(user.userid).toEqual('userid123');
        expect(pspxSpaces).toHaveLength(0);
    });

    it('adds a user to an existing space if that space has a subscription', async () => {
        const paidSpace = await PspxSpaceModel.create({
            spaceId: '123abc',
            billingId: 'billingId',
            hasSubscription: true,
        });

        const unPaidSpace = await PspxSpaceModel.create({
            spaceId: '456def',
            billingId: null,
            hasSubscription: false,
        });

        const paidSpaceRes = await request(app)
            .post('/api/user/addusertospace')
            .send({
                name: 'Bob Pays',
                email: 'richguy@hotmail.net',
                spaceId: paidSpace._id,
            });

        const unpaidSpaceRes = await request(app)
            .post('/api/user/addusertospace')
            .send({
                name: 'Bob Nopays',
                email: 'poorguy@hotmail.net',
                spaceId: unPaidSpace._id,
            });

        const pspxUser = await PspxUserModel.findOne({
            email: 'richguy@hotmail.net',
        });

        expect(pspxUser).toBeTruthy();
        expect(unpaidSpaceRes.status).toEqual(500);
        expect(paidSpaceRes.status).toEqual(200);
    });
});
