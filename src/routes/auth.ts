import express from 'express';
import { login, resetPassword, seekerSignUp, providerSignUp } from '../controller/auth';
const router = express.Router();

router.post('/login', login);
router.post('/seeker/signup', seekerSignUp);
router.post('/provider/signup', providerSignUp)
router.post('/resetPassword', resetPassword);

export default router;
