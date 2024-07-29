import express from 'express';
import { login, resetSeekerPassword, seekerSignUp, providerSignUp, resetProviderPassword } from '../controller/auth';
const router = express.Router();

router.post('/login', login);
router.post('/seeker/signup', seekerSignUp);
router.post('/provider/signup', providerSignUp)
router.post('/seeker/resetPassword', resetSeekerPassword);
router.post('/provider/resetPassword', resetProviderPassword)

export default router;
