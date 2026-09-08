import { Request, Response, NextFunction } from 'express';
import { farmersService } from '../services/farmers.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

export class FarmersController {
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const profile = await farmersService.getFarmerProfile(req.user.profileId);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.farmerId) throw new UnauthorizedError();
      const updated = await farmersService.updateFarmer(req.user.farmerId, undefined, req.body);
      sendSuccess(res, updated, 'Farmer profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const farmersController = new FarmersController();
