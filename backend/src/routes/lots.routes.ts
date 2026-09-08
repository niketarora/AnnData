import { Router } from 'express';
import { lotsController } from '../controllers/lots.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const lotsRoutes = Router();

lotsRoutes.get('/', requireAuth, lotsController.getAllBuyerLots);
lotsRoutes.get('/:id', requireAuth, lotsController.getLotById);
lotsRoutes.get('/:id/recommendations', requireAuth, lotsController.getRecommendations);
lotsRoutes.get('/:id/matched-buyers', requireAuth, lotsController.getMatchedBuyers);
