import { Request, Response, NextFunction } from 'express';
import { buyersService } from '../services/buyers.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

export class BuyersController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const profile = await buyersService.getBuyerProfile(req.user.profileId);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async getAllBuyers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const buyers = await buyersService.getAllBuyers();
      sendSuccess(res, buyers);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const updated = await buyersService.updateBuyer(req.user.buyerId, undefined, req.body);
      sendSuccess(res, updated, 'Buyer profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const buyersController = new BuyersController();
