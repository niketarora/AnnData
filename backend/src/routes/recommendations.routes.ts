import { Router } from 'express';
import { recommendationsController } from '../controllers/recommendations.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const recommendationsRoutes = Router();

recommendationsRoutes.get('/entity/:entityType/:entityId', requireAuth, (req, res, next) => {
  recommendationsController.getByEntity(req, res, next);
});

recommendationsRoutes.post('/entity/:entityType/:entityId/refresh', requireAuth, (req, res, next) => {
  recommendationsController.refreshByEntity(req, res, next);
});

recommendationsRoutes.get('/:id', requireAuth, (req, res, next) => {
  recommendationsController.getById(req, res, next);
});
