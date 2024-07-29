import { Request, Response, NextFunction } from 'express';
import asyncErrorHandler from '../utils/asyncErrorHandler';
import { IRequest } from '../middleware/authenticateMerchant';
import createHttpError from 'http-errors';
import Book, { IBook } from '../models/book';

// book service
export const updateBook = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.userId;
        const { productId, quantity, location } = req.body;
        if (userId) {
            if (quantity == 0) {
                await Book.findOneAndDelete({ userId, productId });
                return res.json({
                    status: 'success',
                    message: 'Product removed',
                });
            }
            const updateBook = await Book.findOneAndUpdate(
                { productId, userId },
                { $inc: { quantity } },
                { new: true }
            );
            if (updateBook) {
                return res.json(updateBook);
            }
            const book = new Book<IBook>({ productId, userId, quantity, location });
            const result = await book.save();
            return res.json(result);
        }
        next(createHttpError(404, 'User not found'));
    }
);
