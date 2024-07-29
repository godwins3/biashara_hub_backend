import express from 'express';
import { addBook, editBook, getAllBooks, getBooksByProviderId, getBooksByUserId, } from '../controller/book';

const router = express.Router();

router.post('/addBook', addBook)
router.post('/editBook', editBook)
router.get('/getBooksByUserId', getBooksByUserId)
router.get('/getBookByProducerId', getBooksByProviderId)
router.get('/getallBooks', getAllBooks)

export default router;
