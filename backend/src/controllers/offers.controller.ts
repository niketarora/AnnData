import { Request, Response, NextFunction } from 'express';
import { offersService } from '../services/offers.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

export class OffersController {
  async getByBookingId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offer = await offersService.getOfferByBooking(req.params.bookingId);
      sendSuccess(res, offer);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offer = await offersService.getOfferById(req.params.id);
      sendSuccess(res, offer);
    } catch (err) {
      next(err);
    }
  }

  async createOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const offer = await offersService.createOffer(req.user.buyerId, req.body);
      sendSuccess(res, offer, 'Binding offer issued to farmer', 201);
    } catch (err) {
      next(err);
    }
  }

  async acceptOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.farmerId) throw new UnauthorizedError();
      const result = await offersService.acceptOffer(req.params.id, req.user.farmerId);
      sendSuccess(res, result, 'Offer accepted. Transaction created in payment pending state.');
    } catch (err) {
      next(err);
    }
  }

  async rejectOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.farmerId) throw new UnauthorizedError();
      const { reason } = req.body;
      const offer = await offersService.rejectOffer(req.params.id, req.user.farmerId, reason);
      sendSuccess(res, offer, 'Offer rejected successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const offersController = new OffersController();
