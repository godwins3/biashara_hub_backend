import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { encPassword, verifyPassword } from '../utils/password';
import asyncErrorHandler from '../utils/asyncErrorHandler';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Merchant from '../models/Merchant';
import Provider, { IProvider } from '../models/Provider';

dotenv.config();

const findUserOrProvider = async (email: string, password: string) => {
    const user = await User.findOne({ email }).select('+password');
    if (user) {
        return { entity: user, hashedPassword: user.password as string };
    }

    const provider = await Provider.findOne({ email }).select('+password');
    if (provider) {
        return { entity: provider, hashedPassword: provider.password as string };
    }

    return null;
};
const getLicenseId = async (userId: string) => {
    const checkMerchant = await Merchant.findOne({ userId });
    return checkMerchant?.licenseId || 0;
};

//  Seeker Signup
export const seekerSignUp = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { username, email, phone, password, role } = req.body;
        const name = username;
        const hashedPassword = await encPassword(password);
        const user = new User({ name, email, phone, password: hashedPassword, role });
        const result = await user.save();
        const resultObject = result.toObject();
        delete resultObject.password;
        const token = jwt.sign(resultObject, process.env.JWT_SECRET_KEY!);
        res.cookie('cookieName', '1234', { maxAge: 900000, httpOnly: true });
        res.json(resultObject);
    }
);

//  Seeker Signup
export const providerSignUp = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { username, email, phone, location, description, password, role } = req.body;
        const name = username;
        const hashedPassword = await encPassword(password);
        const provider = new Provider({ name, email, phone, location, description, password: hashedPassword, role });
        const result = await provider.save();
        const resultObject = result.toObject();
        delete resultObject.password;
        const token = jwt.sign(resultObject, process.env.JWT_SECRET_KEY!);
        res.cookie('cookieName', '1234', { maxAge: 900000, httpOnly: true });
        res.json(resultObject);
    }
);

// Login
export const login = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        const lowerCaseEmail = email.toLowerCase();

        const user = await findUserOrProvider(lowerCaseEmail, password);

        if (!user) {
            return next(createHttpError(404, 'User not found'));
        }

        const { entity, hashedPassword } = user;

        const isMatch = await verifyPassword(password, hashedPassword);

        if (!isMatch) {
            return next(createHttpError(404, 'User not found'));
        }

        const result = entity.toObject();
        delete result.password;

        const licenseId = await getLicenseId(result._id);
        const token = jwt.sign(result, process.env.JWT_SECRET_KEY!);

        res.cookie('ezToken', token);
        res.json({ status: 'Success', licenseId, ...result, token });
    }
);

// Reset password
export const resetPassword = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        const hashedPassword = await encPassword(password);

        const user: IUser | null = await User.findOneAndUpdate(
            {
                email: email.toLowerCase(),
            },
            { password: hashedPassword },
            {
                new: true,
            }
        );
        if (user) {
            res.json({ status: 'Success', message: 'Password changed' });
        } else {
            next(createHttpError(404, 'User not found'));
        }
    }
);

// verify email

