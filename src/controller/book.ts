import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import asyncErrorHandler from '../utils/asyncErrorHandler';
import { IRequest } from '../middleware/authenticateMerchant';
import createHttpError from 'http-errors';
import Book, { IBook } from '../models/book';
import Product, { IProduct } from '../models/Product';
import Provider from '../models/Provider';
import User, { IUser }from '../models/User';
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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

// Define a Booking interface based on the structure of your bookings
interface IBooking {
    _id: string;
    userId: string;
    productId: string;
    quantity: number; // Include other relevant fields as needed
    location?: string; // Optional field if applicable
    createdAt: Date;
    updatedAt: Date;
}

interface UserInfo {
    name: string | null;  // User name can be null
    phone: string | null; // User phone can be null
}

// Fetch All Books by email
export const getBooksByEmail = asyncErrorHandler(
    async (req: IRequest, res: Response, next: NextFunction) => {
        const { email } = req.body;

        try {
            if (!email) {
                return res.status(400).json({ message: 'Email is required' });
            }

            // Step 1: Find the user by email
            const user = await Provider.findOne({ email }).lean();
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const userId = user._id;

            // Step 2: Find all products added by the user
            const products = await Product.find({ userId });
            if (!products.length) {
                return res.status(404).json({ message: 'No products found for this user' });
            }

            // Step 3: Extract product IDs
            const productIds = products.map(product => product._id);

            // Step 4: Fetch bookings associated with those product IDs
            const bookings: IBooking[] = await Book.find({ productId: { $in: productIds } }).lean();

            // Check if any bookings were found
            if (!bookings.length) {
                return res.status(404).json({ message: 'No bookings found for these products' });
            }

            // Function to enrich bookings with user names
            async function enrichOrdersWithUserNames(bookings: IBooking[]): Promise<IBooking[]> {
                const uniqueUserIds = [...new Set(bookings.map(booking => booking.userId))]; // Get unique userIds

                // Debugging: Log the extracted unique userIds
                console.log('Extracted Unique User IDs:', uniqueUserIds);

                const userMap: { [key: string]: UserInfo } = {}; // userMap for storing UserInfo objects
                // Fetch user details for each unique userId
                for (const userId of uniqueUserIds) {
                    const user: IUser | null = await User.findOne({ _id: userId }).exec();
                    if (user) {
                        userMap[userId] = {
                            name: user ? user.name : '',
                            phone: user ? user.phone : null,
                        };
                    } 

                    // Debugging: Log each fetched user
                    console.log(`Fetched User for ID ${userId}:`, user);
                }

                // Enrich bookings with user names
                return bookings.map(booking => ({
                    ...booking, // No need to call toObject() since we used lean()
                    userDetails: userMap[booking.userId] || null // Add user name or null if not found
                }));
            }

            // Enrich bookings with user names
            const enrichedBookings = await enrichOrdersWithUserNames(bookings);

            // Step 5: Return the enriched bookings
            return res.status(200).json(enrichedBookings);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            return res.status(500).json({ message: 'Internal server error', error: error });
        }
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
