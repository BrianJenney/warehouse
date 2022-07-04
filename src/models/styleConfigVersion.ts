import { Schema, model } from 'mongoose';
import { StyleObject } from '../interfaces/styleObject';

interface StyleConfigVersion {
    _id?: string;
    spaceid: string;
    styles: StyleObject[];
    version: number;
    createdAt: string;
    isVersion: boolean | true;
}

const schema = new Schema<StyleConfigVersion>({
    spaceid: { type: String, required: true },
    styles: [
        {
            type: Object,
        },
    ],
    version: { type: Number },
    createdAt: { type: Date, default: new Date() },
});

const StyleConfigVersionModel = model<StyleConfigVersion>(
    'StyleConfigVersion',
    schema
);

export { StyleConfigVersionModel, StyleConfigVersion };
