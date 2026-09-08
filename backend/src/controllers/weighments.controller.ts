import { Request, Response, NextFunction } from 'express';
import { weighmentsService } from '../services/weighments.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

export class WeighmentsController {
  async getByBookingId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const weighment = await weighmentsService.getWeighmentByBooking(req.params.bookingId);
      sendSuccess(res, weighment);
    } catch (err) {
      next(err);
    }
  }

  async recordWeighment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const weighment = await weighmentsService.recordWeighment(req.user.buyerId, req.body);
      sendSuccess(res, weighment, 'Electronic scale weighment verified successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}

export const weighmentsController = new WeighmentsController();
