import { Document, Schema, model } from 'mongoose';

export interface IProvider extends Document {
    name: string;
    email: string;
    phone: string;
    location: string;
    description: string;
    password?: string;
    role: string;
}

const providerSchema = new Schema<IProvider>(
    {
        name: { type: String, required: [true, 'is required field'] },
        email: {
            type: String,
            required: [true, 'is required field'],
            unique: true,
            lowercase: true,
        },
        phone: { type: String, required: [true, 'is required field'] },
        location: { type: String, required: [true, 'is required field'] },
        description: { type: String, required: [true, 'is required field'] },
        password: {
            type: String,
            required: [true, 'is required field'],
            select: false,
        },
        role: {
            type: String,
            required: [true, 'is required field']
        }
    },
    { timestamps: true }
);

const Provider = model<IProvider>('user', providerSchema);

export default Provider;
