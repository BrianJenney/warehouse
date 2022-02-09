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
import { PspxSpaceModel, PspxSpace } from '../models/pspxSpace';

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

        const { isPreview = '', spaceid } = req.query;

        const isDraft: boolean =
            ((isPreview as string) || '').toLocaleLowerCase() === 'true'
                ? true
                : false;

        // return early if no subscription
        const pspxSpace: PspxSpace = await PspxSpaceModel.findOne({
            spaceId: spaceid as string,
        });

        if (!pspxSpace) {
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

        const { isPreview, spaceid, styles, isActive, space } = req.body;

        if (!space.hasSubscription && styles.length > +process.env.MAX_STYLES) {
            return handleErrorResponse(
                {
                    message: `Account type does not support more than ${process.env.MAX_STYLES} styles`,
                },
                res
            );
        }

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

export { getAllConfigs, getConfig, addConfig, saveDraft, toggleActiveState };
