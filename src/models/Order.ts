import mongoose, { Schema, Document } from 'mongoose';

interface IOrder extends Document {
    userId: string;
    items: Array<{
        productId: string;
        quantity: number;
    }>;
    totalAmount: number;
    status: string;
    paymentReference?: string;
}

const OrderSchema: Schema = new Schema({
    userId: { type: String, required: true },
    items: [
        {
            productId: { type: String, required: true },
            quantity: { type: Number, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, required: true, default: 'pending' },
    paymentReference: { type: String },
});

const Order = mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
