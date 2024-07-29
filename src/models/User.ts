import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: string;
    verificationToken: string;
    isVerified: boolean;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: [true, 'is required field'] },
        email: {
            type: String,
            required: [true, 'is required field'],
            unique: true,
            lowercase: true,
        },
        phone: { type: String, required: [true, 'is required field'] },
        password: {
            type: String,
            required: [true, 'is required field'],
            select: false,
        },
        role: {
            type: String,
            required: [true, 'is required field']
        },
        verificationToken: {
            type: String,
            required: [true, 'is required field']
        },
        isVerified: {
            type: Boolean,
            default: false,
            required: [true, 'is required field']
        }
    },
    { timestamps: true }
);

const User = model<IUser>('user', userSchema);

export default User;
