import { Request, Response } from 'express';
import {
    handleErrorResponse,
    throwUnlessValidReq,
    handleSuccessResponse,
} from '../apiHelpers';
import { StyleConfigModel, StyleConfig } from '../models/styleConfig';
import { StyleConfigVersionModel } from '../models/styleConfigVersion';

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

export { getConfig, addConfig, saveDraft };
