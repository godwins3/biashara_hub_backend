import express from 'express';
import { addBook, getBooksByEmail } from '../controller/book';

const router = express.Router();

router.post('/addBook', addBook);
router.post('/getBooksByEmail', getBooksByEmail);

export default router;