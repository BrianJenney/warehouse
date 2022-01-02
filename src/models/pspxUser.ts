import { Schema, model, Types } from 'mongoose';

interface PspxUser {
    _id: string;
    name: string;
    userid: string;
    email: string;
    spaceId: string;
}

const schema = new Schema<PspxUser>({
    name: { type: String },
    email: { type: String, unique: true, required: true },
    userid: { type: String },
    spaceId: { type: Types.ObjectId, ref: 'pspxspace' },
});

const PspxUserModel = model<PspxUser>('PspxUser', schema);

export { PspxUserModel, PspxUser };
