import express from 'express';
import { paymentsGateway, paymentCallback } from '../controller/payments';

const router = express.Router();

router.post('/pay', paymentsGateway);
router.post('/paymentCallback', paymentCallback);
export default router;