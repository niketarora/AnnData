import { Request, Response, NextFunction } from 'express';
import { marketsService } from '../services/markets.service.js';
import { weatherService } from '../integrations/weather.service.js';
import { sendSuccess } from '../utils/response.js';
import { getParam } from '../utils/params.js';

export class MarketsController {
  async getAllMarkets(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const markets = await marketsService.getAllMarkets();
      sendSuccess(res, markets);
    } catch (err) {
      next(err);
    }
  }

  async getMarketById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const market = await marketsService.getMarketById(getParam(req, 'id'));
      sendSuccess(res, market);
    } catch (err) {
      next(err);
    }
  }

  async getMarketWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const weather = await weatherService.getWeatherForMarket(getParam(req, 'id'));
      sendSuccess(res, weather);
    } catch (err) {
      next(err);
    }
  }
}

export const marketsController = new MarketsController();
