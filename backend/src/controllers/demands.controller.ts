import { Request, Response, NextFunction } from 'express';
import { demandsService } from '../services/demands.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';
import { getParam } from '../utils/params.js';

export class DemandsController {
  async getAllDemands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { crop_id, status } = req.query as { crop_id?: string; status?: string };
      const demands = await demandsService.getAllDemands({
        cropId: crop_id,
        status,
      });
      sendSuccess(res, demands);
    } catch (err) {
      next(err);
    }
  }

  async getBuyerDemands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const demands = await demandsService.getAllDemands({ buyerId: req.user.buyerId });
      sendSuccess(res, demands);
    } catch (err) {
      next(err);
    }
  }

  async getDemandById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const demand = await demandsService.getDemandById(getParam(req, 'id'));
      sendSuccess(res, demand);
    } catch (err) {
      next(err);
    }
  }

  async createDemand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const demand = await demandsService.createDemand(req.user.buyerId, req.body);
      sendSuccess(res, demand, 'Buyer demand created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateDemand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const updated = await demandsService.updateDemand(
        getParam(req, 'id'),
        req.user.buyerId,
        req.body,
        req.user.role === 'operator'
      );
      sendSuccess(res, updated, 'Buyer demand updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async deleteDemand(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      await demandsService.deleteDemand(getParam(req, 'id'), req.user.buyerId, req.user.role === 'operator');
      sendSuccess(res, { deleted: true }, 'Buyer demand deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const demandsController = new DemandsController();
