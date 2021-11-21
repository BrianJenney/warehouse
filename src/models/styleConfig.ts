import { Schema, model } from 'mongoose';
import { StyleObject } from '../interfaces/styleObject';

interface StyleConfig {
    _id?: string;
    spaceid: string;
    styles: StyleObject[];
    version?: number | 1;
    draft?: boolean | false;
}

const schema = new Schema<StyleConfig>({
    spaceid: { type: String, required: true },
    styles: [
        {
            type: Object,
        },
    ],
    draft: { type: Boolean, default: false },
    version: { type: Number },
});

const StyleConfigModel = model<StyleConfig>('StyleConfig', schema);

export { StyleConfigModel, StyleConfig };
