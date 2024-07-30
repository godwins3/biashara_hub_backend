import { Request, Response, NextFunction } from 'express';
import asyncErrorHandler from '../utils/asyncErrorHandler';
import { IRequest } from '../middleware/authenticateMerchant';
import createHttpError from 'http-errors';
import Book, { IBook } from '../models/book';
import Product, { IProduct } from '../models/Product';

// Add Book
export const addBook = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { userId, productId, quantity, location } = req.body;

        console.log(req.body)
        console.log(userId)
        // Check for required fields
        if (!productId || !quantity || !location) {
            return next(createHttpError(400, 'All fields are required'));
        }

        const book = new Book({
            userId,
            productId,
            quantity,
            location,
        });
        console.log(book)
        try {
            const savedBook = await book.save();

            res.status(201).json({
                status: 'success',
                data: {
                    book: savedBook,
                },
            });
            console.log(res)
        } catch (error) {
            console.error(error)
            return next(createHttpError(500, 'Failed to save the book'));
        }
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
    async (req: IRequest, res: Response, next: NextFunction) => {
        const userId  = req.userId

        try {
    
            // Step 1: Find all products added by the user
            const products = await Product.find({ userId: userId });
    
            if (!products.length) {
                return res.status(404).json({ message: 'No products found for this user' });
            }
    
            // Step 2: Extract product IDs
            const productIds = products.map(product => product._id);
    
            // Step 3: Fetch bookings associated with those product IDs
            const bookings = await Book.find({ productId: { $in: productIds } });
    
            // Step 4: Return the bookings
            return res.status(200).json(bookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return res.status(500).json({ message: 'Internal server error', error: error });
        }
    });
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
