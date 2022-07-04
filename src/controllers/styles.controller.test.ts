import { StyleConfigModel, StyleConfig } from '../models/styleConfig';
import {
    StyleConfigVersion,
    StyleConfigVersionModel,
} from '../models/styleConfigVersion';
import { PspxSpaceModel } from '../models/pspxSpace';
import request from 'supertest';
import { app } from '../../server';

describe('styles controller', () => {
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
    beforeEach(async () => {
        await PspxSpaceModel.create({
            spaceId,
            billingId: null,
            hasSubscription: false,
            users: [],
        });
    });

    describe('addConfig', () => {
        beforeEach(async () => {
            await StyleConfigModel.deleteMany({});
            await StyleConfigVersionModel.deleteMany({});
        });

        it('rejects requests without a spaceid', async () => {
            const configNoId: StyleConfig = {
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
                .send(configNoId);

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
    describe('getConfig', () => {
        beforeEach(async () => {
            await StyleConfigModel.deleteMany({});
            await StyleConfigVersionModel.deleteMany({});
        });

        it('returns only the active config', async () => {
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
            const activeConfig = await StyleConfigModel.create({
                ...baseConfigDoc,
                isActive: true,
            });

            await StyleConfigModel.create({
                ...baseConfigDoc,
                isActive: false,
            });

            const draft = await StyleConfigModel.create({
                ...baseConfigDoc,
                draft: true,
            });

            const res = await request(app)
                .get('/api/styles/getconfig')
                .query({ spaceid: '123ABC', isPreview: undefined });

            expect(Array.isArray(res.body.styleConfig)).toBeFalsy();

            expect(res.body.styleConfig._id).toEqual(
                activeConfig._id.toString()
            );

            const draftRes = await request(app)
                .get('/api/styles/getconfig')
                .query({ spaceid: '123ABC', isPreview: true });

            expect(Array.isArray(res.body.styleConfig)).toBeFalsy();

            expect(draftRes.body.styleConfig._id).toEqual(draft._id.toString());
        });
    });
    describe('activateOldVersion', () => {
        let versionId: string | undefined;
        const currentVersion = 3;
        const inactiveVersion = 1;
        beforeEach(async () => {
            await StyleConfigModel.deleteMany({});
            await StyleConfigVersionModel.deleteMany({});
            await StyleConfigModel.create({
                spaceid: spaceId,
                version: currentVersion,
                styles: [
                    {
                        element: 'p',
                        styles: ['color: red'],
                        minWidth: 100,
                    },
                ],
                createdAt: new Date().toDateString(),
                isActive: false,
            });

            const configVersion: StyleConfigVersion =
                await StyleConfigVersionModel.create({
                    spaceid: spaceId,
                    version: inactiveVersion,
                    styles: [
                        {
                            element: 'p',
                            styles: ['color: red'],
                            minWidth: 100,
                        },
                    ],
                    createdAt: new Date().toDateString(),
                    isActive: false,
                });

            versionId = configVersion._id;
        });

        it('activates an old version', async () => {
            const res: any = await request(app)
                .post('/api/styles/activateOldVersion')
                .send({ configId: versionId, spaceid: spaceId });

            const [allConfigs, allVersions]: [
                StyleConfig[],
                StyleConfigVersion[]
            ] = await Promise.all([
                StyleConfigModel.find(),
                StyleConfigVersionModel.find(),
            ]);

            expect(allConfigs).toHaveLength(1);
            expect(allVersions).toHaveLength(2);
            expect(allConfigs[0].version).toEqual(currentVersion + 1);
            expect(allVersions.map((v) => v.version).sort()).toEqual([
                inactiveVersion,
                currentVersion,
            ]);
            expect(res.body.styleConfig.version).toEqual(currentVersion + 1);
        });

        it('activates an old version with a draft present', async () => {
            const draftConfig: StyleConfig = await StyleConfigModel.create({
                spaceid: spaceId,
                version: currentVersion + 1,
                styles: [
                    {
                        element: 'p',
                        styles: ['color: red'],
                        minWidth: 100,
                    },
                ],
                draft: true,
                createdAt: new Date().toDateString(),
                isActive: false,
            });

            const res: any = await request(app)
                .post('/api/styles/activateOldVersion')
                .send({ configId: versionId, spaceid: spaceId });

            const [allConfigs, allVersions]: [
                StyleConfig[],
                StyleConfigVersion[]
            ] = await Promise.all([
                StyleConfigModel.find(),
                StyleConfigVersionModel.find(),
            ]);

            expect(allConfigs).toHaveLength(2);
            expect(allVersions).toHaveLength(2);
            expect(
                allConfigs.map((v) => v.version).sort()[allConfigs.length - 1]
            ).toEqual(draftConfig.version + 1);
            expect(allVersions.map((v) => v.version).sort()).toEqual([
                inactiveVersion,
                currentVersion,
            ]);
            expect(res.body.styleConfig.version).toEqual(
                draftConfig.version + 1
            );
        });
    });
});
