import { Request, Response, NextFunction } from 'express';
import asyncErrorHandler from '../utils/asyncErrorHandler';
import createHttpError from 'http-errors';
import Book, { IBook } from '../models/book';

// Add Book
export const addBook = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId, providerId, productId, quantity, location } = req.body;

        if (!userId || !providerId || !productId || !quantity || !location) {
            return next(createHttpError(400, 'All fields are required'));
        }

        const book = new Book({
            userId,
            providerId,
            productId,
            quantity,
            location,
        });

        const savedBook = await book.save();

        res.status(201).json({
            status: 'success',
            data: {
                book: savedBook,
            },
        });
    }
);

// Delete Book
export const deleteBook = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { bookId } = req.params;

        const deletedBook = await Book.findByIdAndDelete(bookId);

        if (!deletedBook) {
            return next(createHttpError(404, 'Book not found'));
        }

        res.status(200).json({
            status: 'success',
            message: 'Book deleted successfully',
        });
    }
);

// Edit Book
export const editBook = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { bookId } = req.params;
        const { userId, providerId, productId, quantity, location } = req.body;

        const updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { userId, providerId, productId, quantity, location },
            { new: true, runValidators: true }
        );

        if (!updatedBook) {
            return next(createHttpError(404, 'Book not found'));
        }

        res.status(200).json({
            status: 'success',
            data: {
                book: updatedBook,
            },
        });
    }
);

// Fetch Book
export const getBook = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { bookId } = req.params;

        const book = await Book.findById(bookId);

        if (!book) {
            return next(createHttpError(404, 'Book not found'));
        }

        res.status(200).json({
            status: 'success',
            data: {
                book,
            },
        });
    }
);

// Fetch All Books
export const getAllBooks = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const books = await Book.find();

        res.status(200).json({
            status: 'success',
            data: {
                books,
            },
        });
    }
);

// Fetch All Books by User ID
export const getBooksByUserId = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params;

        const books = await Book.find({ userId });

        if (!books || books.length === 0) {
            return next(createHttpError(404, 'No bookings found for this user'));
        }

        res.status(200).json({
            status: 'success',
            data: {
                books,
            },
        });
    }
);

// Fetch All Books by User ID
export const getBooksByProviderId = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { providerId } = req.params;

        const books = await Book.find({ providerId });

        if (!books || books.length === 0) {
            return next(createHttpError(404, 'No bookings found for this user'));
        }

        res.status(200).json({
            status: 'success',
            data: {
                books,
            },
        });
    }
);
