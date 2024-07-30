import express from 'express';
import { addProduct, deleteProduct, getProducts, updateProduct } from '../controller/merchant';
const router = express.Router();

router.get('/getProducts', getProducts);
router.post('/addProduct', addProduct);
router.post('/deleteProduct', deleteProduct);
router.post('/updateProduct', updateProduct);

export default router;
