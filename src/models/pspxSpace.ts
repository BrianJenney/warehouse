import { Schema, model, Types } from 'mongoose';
import { PspxUser } from './pspxUser';

interface PspxSpace {
    _id: string;
    spaceId: string;
    users: PspxUser[];
    accountType: string;
    billingId?: string;
    hasSubscription: boolean;
}

const schema = new Schema<PspxSpace>({
    spaceId: { type: String, required: true },
    users: [{ type: Types.ObjectId, ref: 'pspxuser' }],
    billingId: { type: String },
    hasSubscription: { type: Boolean, default: false },
});

const PspxSpaceModel = model<PspxSpace>('PspxSpace', schema);

export { PspxSpaceModel, PspxSpace };
