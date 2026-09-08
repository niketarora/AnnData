import { Request, Response, NextFunction } from 'express';
import { inspectionsService } from '../services/inspections.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

export class InspectionsController {
  async getByBookingId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inspection = await inspectionsService.getInspectionByBooking(req.params.bookingId);
      sendSuccess(res, inspection);
    } catch (err) {
      next(err);
    }
  }

  async submitInspection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const inspection = await inspectionsService.submitPhysicalInspection(req.user.buyerId, req.body);
      sendSuccess(res, inspection, 'Physical inspection recorded successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}

export const inspectionsController = new InspectionsController();
