import { Request, Response, NextFunction } from 'express';
import { cropsService } from '../services/crops.service.js';
import { sendSuccess } from '../utils/response.js';

export class CropsController {
  async getAllCrops(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const crops = await cropsService.getAllCrops();
      sendSuccess(res, crops);
    } catch (err) {
      next(err);
    }
  }

  async getCropById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const crop = await cropsService.getCropById(req.params.id);
      sendSuccess(res, crop);
    } catch (err) {
      next(err);
    }
  }
}

export const cropsController = new CropsController();
