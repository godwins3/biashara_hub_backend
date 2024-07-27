import express from 'express';
import { getMerchants, getUsers } from '../controller/admin';
const router = express.Router();

router.post('/getusers', getUsers);
router.post('/getmerchant', getMerchants);

export default router;
