import { Router } from 'express';
import { dataController } from '../controllers/data.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const dataRoutes = Router();

dataRoutes.get('/sources', requireAuth, (req, res, next) => {
  dataController.getSources(req, res, next);
});

dataRoutes.get('/freshness', requireAuth, (req, res, next) => {
  dataController.getFreshness(req, res, next);
});

dataRoutes.post('/refresh', requireAuth, (req, res, next) => {
  dataController.refreshData(req, res, next);
});

dataRoutes.get('/:entityType/:entityId', requireAuth, (req, res, next) => {
  dataController.getEntityData(req, res, next);
});
