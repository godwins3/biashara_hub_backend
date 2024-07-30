import express from 'express';
import {
    getProducts,
    getProductsByCategory,
    search,
    getServiceProvider,
    getProviderProducts
} from '../controller/client';
const router = express.Router();

router.get('/getProducts', getProducts);
router.get('/getProductsByCategory', getProductsByCategory);
router.get('/search/:searchTerm', search);
router.post('/getServiceProvider', getServiceProvider)
router.post('/getProviderProducts', getProviderProducts)
export default router;
