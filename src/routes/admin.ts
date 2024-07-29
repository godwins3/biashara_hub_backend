import express from 'express';
import { getMerchants, getUsers } from '../controller/admin';
const router = express.Router();

router.get('/getUsers', getUsers);
router.get('/getMerchant', getMerchants);

export default router;
