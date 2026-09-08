import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const notificationsRoutes = Router();

notificationsRoutes.use(requireAuth);

notificationsRoutes.get('/', notificationsController.getNotifications);
notificationsRoutes.patch('/:id/read', notificationsController.markAsRead);
notificationsRoutes.post('/read-all', notificationsController.markAllAsRead);
