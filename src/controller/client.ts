import { Request, Response, NextFunction } from 'express';
import asyncErrorHandler from '../utils/asyncErrorHandler';
import { IRequest } from '../middleware/authenticateMerchant';
import User from '../models/User';
import Merchant, { IMerchant } from '../models/Merchant';
import createHttpError from 'http-errors';
import Product from '../models/Product';
import Cart, { ICart } from '../models/Cart';
import Wish, { IWish } from '../models/Wish';

// Become to Merchant
export const becomeMerchant = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.userId;
        const { licenseId } = req.body;
        const merchantExist = await Merchant.findOne({ userId });
        if (!merchantExist) {
            if (userId) {
                const merchant = new Merchant<IMerchant>({ userId, licenseId });
                const result = await merchant.save();
                const resObj = result.toObject();
                return res.status(201).json({ status: 'success', ...resObj });
            }
        } else {
            return res
                .status(200)
                .json({ status: 'success', message: 'Already a merchant' });
        }
        next(createHttpError(401, 'Request not allowed'));
    }
);

// Get all products
export const getProducts = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { pageNumber, limit } = req.query;
        const query = Product.find()
            .sort({ createdAt: -1 })
            .skip((Number(pageNumber) - 1) * Number(limit))
            .limit(Number(limit));
        const products = await query.exec();
        res.json(products);
    }
);

// Get products by category with default sorting
export const getProductsByCategory = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { category, pageNumber, limit } = req.query;
        const query = Product.find({ category: category })
            .sort({ createdAt: -1 })
            .skip((Number(pageNumber) - 1) * Number(limit))
            .limit(Number(limit));
        const products = await query.exec();
        res.json(products);
    }
);

// Add to cart
export const updateCart = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.userId;
        const { productId, quantity } = req.body;
        if (userId) {
            if (quantity == 0) {
                await Cart.findOneAndDelete({ userId, productId });
                return res.json({
                    status: 'success',
                    message: 'Product removed',
                });
            }
            const updateCart = await Cart.findOneAndUpdate(
                { productId, userId },
                { $inc: { quantity } },
                { new: true }
            );
            if (updateCart) {
                return res.json(updateCart);
            }
            const cart = new Cart<ICart>({ productId, userId, quantity });
            const result = await cart.save();
            return res.json(result);
        }
        next(createHttpError(404, 'User not found'));
    }
);

// View Cart
export const viewCart = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.userId;
        if (userId) {
            const cart = await Cart.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productData',
                    },
                },
            ]);
            return res.json(cart);
        }
        next(createHttpError(404, 'User not found'));
    }
);

// Get Cart Count
export const cartCount = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.userId;
        const count = await Cart.countDocuments({ userId });
        return res.json(count);
    }
);

// remove from cart
export const removeFromCart = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.userId;
        const { productId } = req.body;

        if (!userId) {
            return next(createHttpError(404, 'User not found'));
        }

        const cartItem = await Cart.findOneAndDelete({ userId, productId });

        if (!cartItem) {
            return next(createHttpError(404, 'Product not found in cart'));
        }

        return res.json({
            status: 'success',
            message: 'Product removed from cart',
        });
    }
);

// Search
export const search = asyncErrorHandler(async (req, res, next) => {
    const { searchTerm } = req.params;
    const results = await Product.find({
        $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
        ],
    }).exec();
    console.log(results);

    res.json(results);
});

// add to wishlist
export const updateWish = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.userId;
        const { productId, quantity } = req.body;
        if (userId) {
            if (quantity == 0) {
                await Cart.findOneAndDelete({ userId, productId });
                return res.json({
                    status: 'success',
                    message: 'Product removed',
                });
            }
            const updateCart = await Wish.findOneAndUpdate(
                { productId, userId },
                { $inc: { quantity } },
                { new: true }
            );
            if (updateCart) {
                return res.json(updateCart);
            }
            const wish = new Wish<IWish>({ productId, userId, quantity });
            const result = await wish.save();
            return res.json(result);
        }
        next(createHttpError(404, 'User not found'));
    }
);

// view wish
export const viewWish = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.userId;
        if (userId) {
            const wish = await Wish.aggregate([
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'productData',
                    },
                },
            ]);
            return res.json(wish);
        }
        next(createHttpError(404, 'User not found'));
    }
);

// remove from wishlist
export const removeFromWish = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId = req.userId;
        const { productId } = req.body;

        if (!userId) {
            return next(createHttpError(404, 'User not found'));
        }

        const wishItem = await Wish.findOneAndDelete({ userId, productId });

        if (!wishItem) {
            return next(createHttpError(404, 'Product not found in wish list'));
        }

        return res.json({
            status: 'success',
            message: 'Product removed from wish list',
        });
    }
);



// TODO:
// Product rating
// Product Reviews