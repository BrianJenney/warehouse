import { Schema, model, Types } from 'mongoose';

interface PspxUser {
    _id: string;
    name: string;
    userid: string;
    email: string;
    spaceId: string;
}

const schema = new Schema<PspxUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    userid: { type: String, required: true },
    spaceId: { type: Types.ObjectId, ref: 'pspxspace' },
});

const PspxUserModel = model<PspxUser>('PspxUser', schema);

export { PspxUserModel, PspxUser };
