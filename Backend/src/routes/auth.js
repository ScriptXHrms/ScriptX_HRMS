import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

const limiterOptions = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
};

const loginLimiter = rateLimit({ ...limiterOptions, limit: 30, skipSuccessfulRequests: true });
const resetLimiter = rateLimit({ ...limiterOptions, limit: 10 });

router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getMeSoft);
router.post('/change-password', protect, authController.changePassword);
router.post('/forgot-password', resetLimiter, authController.forgotPassword);
router.post('/reset-password', resetLimiter, authController.resetPassword);

export default router;
