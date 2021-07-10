import { Schema, model } from 'mongoose';

interface User {
    name: string;
    email: string;
    userType: string;
    avatar: string;
}
const schema = new Schema<User>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    userType: {
        type: String,
        enum: ['artist', 'user'],
    },
    avatar: { type: String },
});

const UserModel = model<User>('User', schema);

export { UserModel };
