import { Schema, model } from 'mongoose';

export interface IBook {
    userId: Schema.Types.ObjectId;
    productId: Schema.Types.ObjectId;
    quantity: number;
    location: string;
}

const bookSchema = new Schema<IBook>({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, 'User id is required'],
    },
    productId: {
        type: Schema.Types.ObjectId,
        required: [true, 'Product id is required'],
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
    },
},
{ timestamps: true }
);

const Book = model<IBook>('Book', bookSchema);

export default Book;