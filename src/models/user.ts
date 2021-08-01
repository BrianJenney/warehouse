import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
interface User {
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
    avatar: string;
    city: string;
    state: string;
    password: string;
    userName: string;
    artistName: string;
    socialMedia: string[];
    bio: string;
}

const schema = new Schema<User>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    userType: {
        type: String,
        enum: ['artist', 'user'],
        default: 'user',
    },
    userName: { type: String },
    artistName: { type: String },
    city: { type: String },
    state: { type: String },
    password: { type: String, required: true },
    socialMedia: [{ type: String }],
    bio: { type: String, maxLength: 750 },
    songMax: { type: Number, default: 3 },
});

schema.methods.generateHash = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

// checking if password is valid
schema.methods.validPassword = (password: string) => {
    return bcrypt.compareSync(password, password);
};

const UserModel = model<User>('User', schema);

export { UserModel, User };
