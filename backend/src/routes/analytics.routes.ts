import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const analyticsRoutes = Router();

analyticsRoutes.use(requireAuth);

analyticsRoutes.get('/farmer', requireRole('farmer'), analyticsController.getFarmerAnalytics);
analyticsRoutes.get('/buyer', requireRole('buyer', 'operator'), analyticsController.getBuyerAnalytics);
