import { NextFunction, Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { encPassword, verifyPassword } from '../utils/password';
import asyncErrorHandler from '../utils/asyncErrorHandler';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Provider, { IProvider } from '../models/Provider';
import Merchant, { IMerchant } from '../models/Merchant';

import { generateVerificationToken, sendVerificationEmail, sendEmail} from '../utils/emailVerification';

dotenv.config();

const findUserOrProvider = async (email: string, password: string) => {
    const user = await User.findOne({ email }).select('+password +isVerified');
    if (user) {
        return { entity: user, hashedPassword: user.password as string, isVerified: user.isVerified };
    }

    const provider = await Provider.findOne({ email }).select('+password +isVerified');
    if (provider) {
        return { entity: provider, hashedPassword: provider.password as string, isVerified: provider.isVerified };
    }

    return null;
};

const findUserOrProviderToken = async (token: string) => {
    const user = await User.findOne({ verificationToken: token }).select('+verificationToken +isVerified');
    if (user) {
        return { entity: user, verificationToken: user.verificationToken as string, isVerified: user.isVerified };
    }

    const provider = await Provider.findOne({ verificationToken: token }).select('+verificationToken +isVerified');
    if (provider) {
        return { entity: provider, verificationToken: provider.verificationToken as string, isVerified: provider.isVerified };
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
        const verificationToken = generateVerificationToken();
        const user = new User({ name, email, phone, password: hashedPassword, role, verificationToken });
        const result = await user.save();
        await sendVerificationEmail(email, verificationToken, role);
        const resultObject = result.toObject();
        res.json({ status: 'Success', message: 'User registered. Please verify your email.' });
    }
);

//  Provider Signup
export const providerSignUp = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { username, email, phone, location, description, password, role } = req.body;
        const name = username;
        const hashedPassword = await encPassword(password);
        const verificationToken = generateVerificationToken();
        const provider = new Provider({ name, email, phone, location, description, password: hashedPassword, role, verificationToken });
        const result = await provider.save();
        await sendVerificationEmail(email, verificationToken, role);
        const resultObject = result.toObject();
        res.json({ status: 'Success', message: 'Provider registered. Please verify your email.' });
    }
);

// Unified Provider Signup and Merchant Creation
export const providerSignUpAndBecomeMerchant = [
    asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { username, email, phone, location, description, password, role } = req.body;

        // Check for existing provider
        const existingProvider = await Provider.findOne({ email });
        if (existingProvider) {
            return res.status(400).json({ status: 'Error', message: 'Provider with this email already exists.' });
        }

        // Hash the password
        const hashedPassword = await encPassword(password);

        // Generate a verification token
        const verificationToken = generateVerificationToken();

        // Create a new provider instance
        const provider = new Provider({
            name: username,
            email,
            phone,
            location,
            description,
            password: hashedPassword,
            role,
            verificationToken
        });

        // Save the provider to the database
        const savedProvider = await provider.save();

        // Send a verification email
        await sendVerificationEmail(email, verificationToken, role);

        // Automatically create a merchant for the provider
        const userId = savedProvider._id;
        const merchant = new Merchant<IMerchant>({ userId, licenseId: 'test' }); // Assuming licenseId can be empty initially
        const savedMerchant = await merchant.save();

        // Respond with a success message
        res.status(201).json({
            status: 'Success',
            message: 'Provider registered and automatically made a merchant. Please verify your email.',
            provider: savedProvider,
            merchant: savedMerchant
        });
    })
];

// Verify email
export const verifyEmail = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.query;

        // Find the user or provider by token
        const userOrProvider = await findUserOrProviderToken(token as string);

        // If token is invalid, return 404 error
        if (!userOrProvider) {
            return next(createHttpError(404, 'Invalid token'));
        }

        const { entity } = userOrProvider;

        // Update isVerified to true
        entity.isVerified = true;
        await entity.save();

        // Respond with success status
        res.json({ status: 'Success', message: 'Email verified' });
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

        // Check if the user's email is verified
        if (!user.isVerified) {
            return next(createHttpError(403, 'Email not verified. Please verify your email to log in.'));
        }

        const { entity, hashedPassword } = user;

        const isMatch = await verifyPassword(password, hashedPassword);

        if (!isMatch) {
            return next(createHttpError(404, 'Wrong password'));
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
export const resetSeekerPassword = asyncErrorHandler(
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

export const resetProviderPassword = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;
        const hashedPassword = await encPassword(password);

        const user: IProvider | null = await Provider.findOneAndUpdate(
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