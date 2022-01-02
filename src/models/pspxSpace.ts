import { Schema, model, Types, ValidateFn } from 'mongoose';
import { PspxUser } from './pspxUser';

interface PspxSpace {
    _id: string;
    spaceId: string;
    users: PspxUser[];
    accountType: string;
    billingId?: string;
    hasSubscription: boolean;
}

function arrayLimit(val: [any]) {
    return val.length <= 10;
}

const schema = new Schema<PspxSpace>({
    spaceId: { type: String, required: true },
    users: [
        {
            type: Types.ObjectId,
            ref: 'pspxuser',
            validate: [
                arrayLimit,
                `{PATH} exceeds the limit of ${process.env.MAX_USERS}`,
            ],
        },
    ],
    billingId: { type: String },
    hasSubscription: { type: Boolean, default: false },
});

const PspxSpaceModel = model<PspxSpace>('PspxSpace', schema);

export { PspxSpaceModel, PspxSpace };
