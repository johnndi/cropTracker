// routes/authRoutes.js
import { Router } from 'express';
import { login, logout, getMe } from '../controllers/authController.js';
import { protect } from '../Middlewares/auth.js';

const router = Router();

// Public route
router.post('/login', login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;