import { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import Merchant from '../models/Merchant';
import asyncErrorHandler from '../utils/asyncErrorHandler';
import Product from '../models/Product';

// Get all users count
export const getUsers = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userCount = await User.countDocuments().exec();
        res.json({
            count: userCount
        });
    }
);

// Get all merchants
export const getMerchants = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { pageNumber, limit } = req.query;
        const query = Merchant.find()
            .sort({ createdAt: -1 })
            .skip((Number(pageNumber) - 1) * Number(limit))
            .limit(Number(limit));
        const merchantCount = await Merchant.countDocuments().exec();
        const merchantDetails = await query.exec();
        res.json({
            count: merchantCount,
            users: merchantDetails,
        });
    }
);

// get all products count
export const getProducts = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const productCount = await Product.countDocuments().exec();
        res.json({
            count: productCount
        });
    }
);