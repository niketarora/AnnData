import { Router } from 'express';
import { marketsController } from '../controllers/markets.controller.js';

export const marketsRoutes = Router();

marketsRoutes.get('/', marketsController.getAllMarkets);
marketsRoutes.get('/:id', marketsController.getMarketById);
marketsRoutes.get('/:id/weather', marketsController.getMarketWeather);
