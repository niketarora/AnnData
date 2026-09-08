import { Router } from 'express';
import { predictionsController } from '../controllers/predictions.controller.js';
import { recommendationsController } from '../controllers/recommendations.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const entitiesRoutes = Router();

// Section 28: GET /api/v1/entities/:entityType/:entityId/predictions
entitiesRoutes.get('/:entityType/:entityId/predictions', requireAuth, (req, res, next) => {
  predictionsController.getByEntity(req, res, next);
});

// Section 29: GET & POST /api/v1/entities/:entityType/:entityId/recommendation
entitiesRoutes.get('/:entityType/:entityId/recommendation', requireAuth, (req, res, next) => {
  recommendationsController.getByEntity(req, res, next);
});

entitiesRoutes.post('/:entityType/:entityId/recommendation/refresh', requireAuth, (req, res, next) => {
  recommendationsController.refreshByEntity(req, res, next);
});
