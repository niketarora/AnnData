import { Request, Response, NextFunction } from 'express';
import { bookingsService } from '../services/bookings.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';
import { getParam } from '../utils/params.js';

export class BookingsController {
  async getFarmerBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.farmerId) throw new UnauthorizedError();
      const bookings = await bookingsService.getFarmerBookings(req.user.farmerId);
      sendSuccess(res, bookings);
    } catch (err) {
      next(err);
    }
  }

  async getBuyerBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const bookings = await bookingsService.getBuyerBookings(req.user.buyerId);
      sendSuccess(res, bookings);
    } catch (err) {
      next(err);
    }
  }

  async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const booking = await bookingsService.getBookingById(
        getParam(req, 'id'),
        req.user.role,
        req.user.farmerId,
        req.user.buyerId
      );
      sendSuccess(res, booking);
    } catch (err) {
      next(err);
    }
  }

  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.farmerId) throw new UnauthorizedError();
      const booking = await bookingsService.createBooking(req.user.farmerId, req.body);
      sendSuccess(res, booking, 'Booking requested successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async assignSlotAndAccept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const { slot_start, slot_end, market_code } = req.body;
      const booking = await bookingsService.acceptBookingAndAssignSlot(
        getParam(req, 'id'),
        req.user.buyerId,
        slot_start,
        slot_end,
        market_code
      );
      sendSuccess(res, booking, 'Slot assigned and token generated successfully');
    } catch (err) {
      next(err);
    }
  }

  async rejectBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const { reason } = req.body;
      const booking = await bookingsService.rejectBooking(getParam(req, 'id'), req.user.buyerId, reason || 'Rejected by buyer');
      sendSuccess(res, booking, 'Booking rejected successfully');
    } catch (err) {
      next(err);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { reason } = req.body;
      const booking = await bookingsService.cancelBooking(
        getParam(req, 'id'),
        req.user.farmerId || req.user.buyerId || req.user.userId,
        reason || 'Cancelled by user'
      );
      sendSuccess(res, booking, 'Booking cancelled successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const bookingsController = new BookingsController();
