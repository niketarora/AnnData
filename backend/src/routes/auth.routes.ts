import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRoutes = Router();

authRoutes.get('/me', requireAuth, authController.getMe);
