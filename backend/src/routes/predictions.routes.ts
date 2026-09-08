import { Router } from 'express';
import { predictionsController } from '../controllers/predictions.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const predictionsRoutes = Router();

predictionsRoutes.post('/', requireAuth, (req, res, next) => {
  predictionsController.create(req, res, next);
});

predictionsRoutes.get('/:id', requireAuth, (req, res, next) => {
  predictionsController.getById(req, res, next);
});

predictionsRoutes.get('/entity/:entityType/:entityId', requireAuth, (req, res, next) => {
  predictionsController.getByEntity(req, res, next);
});
