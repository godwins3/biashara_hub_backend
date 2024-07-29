import express from 'express';
import { login, resetSeekerPassword, seekerSignUp, providerSignUp, resetProviderPassword, verifyEmail, providerSignUpAndBecomeMerchant } from '../controller/auth';
const router = express.Router();

router.post('/login', login);
router.post('/seeker/signup', seekerSignUp);
router.post('/provider/signup', providerSignUpAndBecomeMerchant);
router.post('/seeker/resetPassword', resetSeekerPassword);
router.post('/provider/resetPassword', resetProviderPassword);
router.get('/seeker/verify-email', verifyEmail)
router.get('/provider/verify-email', verifyEmail)

export default router;
