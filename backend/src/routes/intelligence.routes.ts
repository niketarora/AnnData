import { Router } from 'express';
import { intelligenceController } from '../controllers/intelligence.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const intelligenceRoutes = Router();

intelligenceRoutes.get('/:entityType/:entityId', requireAuth, (req, res, next) => {
  intelligenceController.getBundle(req, res, next);
});

intelligenceRoutes.post('/:entityType/:entityId/refresh', requireAuth, (req, res, next) => {
  intelligenceController.refreshBundle(req, res, next);
});
