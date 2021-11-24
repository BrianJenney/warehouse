import { Schema, model } from 'mongoose';
import { StyleObject } from '../interfaces/styleObject';

interface StyleConfigVersion {
    _id?: string;
    spaceid: string;
    styles: StyleObject[];
    version: number;
}

const schema = new Schema<StyleConfigVersion>({
    spaceid: { type: String, required: true },
    styles: [
        {
            type: Object,
        },
    ],
    version: { type: Number },
});

const StyleConfigVersionModel = model<StyleConfigVersion>(
    'StyleConfigVersion',
    schema
);

export { StyleConfigVersionModel, StyleConfigVersion };
