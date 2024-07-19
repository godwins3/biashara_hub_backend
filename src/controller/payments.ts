import createHttpError from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import asyncErrorHandler from '../utils/asyncErrorHandler';
import { IRequest } from '../middleware/authenticateMerchant';
import { initiatePayment } from '../utils/processPayments';
import Order from '../models/Order';

// process payments
export const paymentsGateway = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.userId;
        if (userId) {
            const { items, totalAmount, email, phoneNumber } = req.body;

            const newOrder = new Order({
                userId,
                items,
                totalAmount,
            });

            try {
                // Log the incoming request details
                console.log('Incoming payment request:', req.body);

                const savedOrder = await newOrder.save();
                console.log('Saved order:', savedOrder);

                const paymentData = {
                    Amount: totalAmount,
                    Description: 'Order Payment',
                    Type: 'MERCHANT',
                    Reference: savedOrder._id.toString(),
                    PhoneNumber: phoneNumber,
                    Email: email,
                    Currency: 'KES', // Adjust currency as needed
                    NotificationUrl: 'https://5vcn1jml-5000.euw.devtunnels.ms/api/payment/paymentCallback/', // URL to receive payment status updates
                    CallbackUrl: 'https://5vcn1jml-3001.euw.devtunnels.ms/', // URL to redirect after payment
                };

                // Log payment data before initiating payment
                console.log('Payment data:', paymentData);

                const paymentResponse = await initiatePayment(paymentData);
                console.log('Payment response:', paymentResponse);

                return res.json({
                    order: savedOrder,
                    payment: paymentResponse,
                });
            } catch (error) {
                // Log errors if any occur during payment processing
                console.error('Error during payment processing:', error);
                return next(error);
            }
        }
        // Log user not found error
        console.error('User not found');
        next(createHttpError(404, 'User not found'));
    }
);

// pesa pal callback 
export const paymentCallback = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const notificationData = req.body;

        try {
            // Log incoming notification data
            console.log('Incoming payment callback:', notificationData);

            const { Reference, status } = notificationData; // Adjust based on actual notification structure

            const order = await Order.findById(Reference);
            if (!order) {
                // Log order not found error
                console.error('Order not found');
                return res.status(404).send('Order not found');
            }

            order.status = status; // Update status based on notification
            await order.save();

            // Log successful notification processing
            console.log('Order status updated:', order);

            res.status(200).send('Notification received');
        } catch (error) {
            // Log errors if any occur during notification processing
            console.error('Error during notification processing:', error);
            return next(error);
        }
    }
);
