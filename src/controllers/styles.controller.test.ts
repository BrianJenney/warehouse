import { StyleConfigModel, StyleConfig } from '../models/styleConfig';
import {
    StyleConfigVersion,
    StyleConfigVersionModel,
} from '../models/styleConfigVersion';
import { PspxUserModel } from '../models/pspxUser';
import { PspxSpaceModel } from '../models/pspxSpace';
import request from 'supertest';
import { app } from '../../server';

describe('styles controller', () => {
    describe('addConfig', () => {
        beforeEach(async () => {
            await StyleConfigModel.deleteMany({});
            await StyleConfigVersionModel.deleteMany({});
        });

        const spaceId = '123ABC';
        const newConfig: StyleConfig = {
            spaceid: spaceId,
            styles: [
                {
                    element: 'p',
                    styles: ['color: red'],
                    minWidth: 100,
                    maxWidth: null,
                },
            ],
            createdAt: new Date().toDateString(),
            isActive: false,
        };

        it('rejects requests without a spaceid', async () => {
            const newConfig: StyleConfig = {
                spaceid: undefined,
                styles: [
                    {
                        element: 'p',
                        styles: ['color: red'],
                        minWidth: 100,
                        maxWidth: null,
                    },
                ],
                createdAt: new Date().toDateString(),
                isActive: false,
            };
            const res = await request(app)
                .post('/api/styles/addconfig')
                .send(newConfig);

            expect(res.status).toEqual(500);
        });

        it('saves a non-draft', async () => {
            const res = await request(app)
                .post('/api/styles/addconfig')
                .send(newConfig);

            const configDoc: StyleConfig = await StyleConfigModel.findOne({
                spaceid: spaceId,
                draft: false,
            });

            expect(configDoc.draft).toEqual(false);
            expect(res.status).toEqual(200);
        });

        it('saves a non-draft and creates a new version if an old one exists', async () => {
            await StyleConfigModel.create({
                spaceid: spaceId,
                styles: [
                    {
                        element: 'p',
                        styles: ['color: red'],
                        minWidth: 100,
                        maxWidth: null,
                    },
                ],
                createdAt: new Date().toDateString(),
                isActive: false,
            });

            const res = await request(app)
                .post('/api/styles/addconfig')
                .send(newConfig);

            const configDoc: StyleConfig = await StyleConfigModel.findOne({
                spaceid: spaceId,
                draft: false,
            });

            const versionDoc: StyleConfigVersion =
                await StyleConfigVersionModel.findOne({
                    spaceid: spaceId,
                    version: 1,
                });

            expect(configDoc.version).toEqual(2);
            expect(versionDoc.version).toEqual(1);
            expect(res.status).toEqual(200);
        });

        it('saves a draft', async () => {
            const draftConfig: StyleConfig = newConfig;
            const res = await request(app)
                .post('/api/styles/addconfig')
                .send({ ...draftConfig, isPreview: true });

            const configDoc: StyleConfig = await StyleConfigModel.findOne({
                spaceid: spaceId,
            });

            expect(res.status).toEqual(200);
            expect(configDoc.draft).toEqual(true);
        });
    });

    describe('saveDraft', () => {
        beforeEach(async () => {
            await StyleConfigModel.deleteMany({});
            await StyleConfigVersionModel.deleteMany({});
        });

        it('updates the draft to a non-draft and moves the most recent non-draft to the version model', async () => {
            const spaceId = '123ABC';
            const baseConfigDoc: StyleConfig = {
                spaceid: spaceId,
                styles: [
                    {
                        element: 'p',
                        styles: ['color: red'],
                        minWidth: 100,
                        maxWidth: null,
                    },
                ],
                createdAt: new Date().toDateString(),
                isActive: false,
            };
            const oldNonDraft = await StyleConfigModel.create(baseConfigDoc);
            const currentDraft = await StyleConfigModel.create({
                ...baseConfigDoc,
                draft: true,
            });

            const res = await request(app)
                .post('/api/styles/savedraft')
                .send({ draftId: currentDraft._id, spaceid: spaceId });

            const configDoc: StyleConfig = await StyleConfigModel.findOne({
                spaceid: spaceId,
            });

            const versionDoc: StyleConfigVersion =
                await StyleConfigVersionModel.findOne({
                    spaceid: spaceId,
                    version: 1,
                });

            expect(res.status).toEqual(200);
            expect(configDoc._id).toEqual(currentDraft._id);
            expect(configDoc.version).toEqual(oldNonDraft.version + 1);
            expect(versionDoc._id).toEqual(oldNonDraft._id);
        });
    });

    describe('users actions', () => {
        beforeEach(async () => {
            await PspxUserModel.deleteMany({});
            await PspxSpaceModel.deleteMany({});
        });

        it('adds a user to a space', async () => {
            const res = await request(app).post('/api/styles/adduser').send({
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

            await request(app).post('/api/styles/adduser').send({
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
                .post('/api/styles/addusertospace')
                .send({
                    name: 'Bob Pays',
                    email: 'richguy@hotmail.net',
                    spaceId: paidSpace._id,
                });

            const unpaidSpaceRes = await request(app)
                .post('/api/styles/addusertospace')
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
});
