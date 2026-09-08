import { Request, Response, NextFunction } from 'express';
import { grievancesService } from '../services/grievances.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

export class GrievancesController {
  async getGrievances(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const userId = req.user.role === 'operator' ? undefined : req.user.profileId;
      const grievances = await grievancesService.getGrievances(userId);
      sendSuccess(res, grievances);
    } catch (err) {
      next(err);
    }
  }

  async getGrievanceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const grievance = await grievancesService.getGrievanceById(req.params.id);
      sendSuccess(res, grievance);
    } catch (err) {
      next(err);
    }
  }

  async fileGrievance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const grievance = await grievancesService.fileGrievance(req.user.profileId, req.body);
      sendSuccess(res, grievance, 'Grievance submitted successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async resolveGrievance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { resolution, status } = req.body;
      const updated = await grievancesService.resolveGrievance(
        req.params.id,
        req.user.profileId,
        resolution,
        status
      );
      sendSuccess(res, updated, 'Grievance updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const grievancesController = new GrievancesController();
