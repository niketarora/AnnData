import { Request, Response, NextFunction } from 'express';
import { lotsService } from '../services/lots.service.js';
import { recommendationService } from '../services/recommendations.service.js';
import { buyerMatchingService } from '../services/buyerMatching.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';
import { getParam } from '../utils/params.js';

export class LotsController {
  async getFarmerLots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.farmerId) throw new UnauthorizedError();
      const lots = await lotsService.getFarmerLots(req.user.farmerId);
      sendSuccess(res, lots);
    } catch (err) {
      next(err);
    }
  }

  async getAllBuyerLots(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query as { status?: string };
      const lots = await lotsService.getAllBuyerLots(status);
      sendSuccess(res, lots);
    } catch (err) {
      next(err);
    }
  }

  async getLotById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const lot = await lotsService.getLotById(getParam(req, 'id'), req.user.role, req.user.farmerId);
      sendSuccess(res, lot);
    } catch (err) {
      next(err);
    }
  }

  async createLot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.farmerId) throw new UnauthorizedError();
      const lot = await lotsService.createLot(req.user.farmerId, req.body);
      sendSuccess(res, lot, 'Crop lot created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateLot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const updated = await lotsService.updateLot(
        getParam(req, 'id'),
        req.user.farmerId || '',
        req.body,
        req.user.role === 'buyer' || req.user.role === 'operator'
      );
      sendSuccess(res, updated, 'Crop lot updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async addLotImages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.farmerId) throw new UnauthorizedError();
      const images = await lotsService.addLotImages(getParam(req, 'id'), req.user.farmerId, req.body.images);
      sendSuccess(res, images, 'Lot images uploaded successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recommendations = await recommendationService.getRecommendationsForLot(getParam(req, 'id'));
      sendSuccess(res, recommendations);
    } catch (err) {
      next(err);
    }
  }

  async getMatchedBuyers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const matched = await buyerMatchingService.matchBuyersForLot(getParam(req, 'id'));
      sendSuccess(res, matched);
    } catch (err) {
      next(err);
    }
  }
}

export const lotsController = new LotsController();
