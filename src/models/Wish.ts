import { Schema, model } from 'mongoose';

export interface IWish {
    userId: Schema.Types.ObjectId;
    productId: Schema.Types.ObjectId;
    quantity: number;
}

const wishSchema = new Schema<IWish>({
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
});

const Wish = model<IWish>('wish', wishSchema);

export default Wish;
