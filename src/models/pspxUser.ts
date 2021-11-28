import { Schema, model, Types } from 'mongoose';

import bcrypt from 'bcryptjs';
interface PspxUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    spaceId: string;
    isValidPassword(password: string, hash: string): boolean;
}

const schema = new Schema<PspxUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false },
    spaceId: { type: Types.ObjectId, ref: 'pspxspace' },
});

schema.pre('save', function save(next) {
    if (!this.isModified('password')) return next();
    try {
        this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
        return next();
    } catch (err) {
        return next(err);
    }
});

// checking if password is valid
schema.methods.isValidPassword = (password: string, hash: string) => {
    return bcrypt.compareSync(password, hash);
};

const PspxUserModel = model<PspxUser>('PspxUser', schema);

export { PspxUserModel, PspxUser };
