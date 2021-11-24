import { StyleConfigModel, StyleConfig } from '../models/styleConfig';
import {
    StyleConfigVersion,
    StyleConfigVersionModel,
} from '../models/styleConfigVersion';
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
});
