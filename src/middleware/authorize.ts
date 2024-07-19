import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import createHttpError from 'http-errors';

dotenv.config();

export const authorize = (req: Request, res: Response, next: NextFunction) => {
    const authKey = req.headers.authorization;

    // if (!authKey) {
    //     return next(createHttpError(401, 'Unauthorized'));
    // }
    next();
};
