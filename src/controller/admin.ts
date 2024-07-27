import { NextFunction, Request, Response } from 'express';
import User from '../models/User';
import Merchant from '../models/Merchant';
import asyncErrorHandler from '../utils/asyncErrorHandler';

// Get all users
export const getUsers = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { pageNumber, limit } = req.query;
        const query = User.find()
            .sort({ createdAt: -1 })
            .skip((Number(pageNumber) - 1) * Number(limit))
            .limit(Number(limit));
        const userCount = await User.countDocuments().exec();
        const userDetails = await query.exec();
        res.json({
            count: userCount,
            users: userDetails,
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
        const merchantCount = await User.countDocuments().exec();
        const merchantDetails = await query.exec();
        res.json({
            count: merchantCount,
            users: merchantDetails,
          });
    }
);
