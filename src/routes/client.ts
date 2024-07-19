import express from 'express';
import {
    becomeMerchant,
    cartCount,
    getProducts,
    getProductsByCategory,
    search,
    updateCart,
    viewCart,
    updateWish,
    viewWish,
} from '../controller/client';
const router = express.Router();

router.get('/getProducts', getProducts);
router.get('/getProductsByCategory', getProductsByCategory);
router.get('/viewCart', viewCart);
router.get('/search/:searchTerm', search);
router.get('/cartCount', cartCount);
router.post('/becomeMerchant', becomeMerchant);
router.post('/updateCart', updateCart);
router.post('/addWish', updateWish);
router.post('/viewWish', viewWish)
export default router;
