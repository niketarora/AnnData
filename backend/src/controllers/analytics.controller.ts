import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

export class AnalyticsController {
  async getFarmerAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.farmerId) throw new UnauthorizedError();
      const analytics = await analyticsService.getFarmerAnalytics(req.user.farmerId);
      sendSuccess(res, analytics);
    } catch (err) {
      next(err);
    }
  }

  async getBuyerAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const analytics = await analyticsService.getBuyerAnalytics(req.user.buyerId);
      sendSuccess(res, analytics);
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
