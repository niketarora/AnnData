import { Request, Response, NextFunction } from 'express';
import { queueService } from '../services/queue.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';
import { getParam } from '../utils/params.js';

export class QueueController {
  async getQueueStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = await queueService.getQueueState(getParam(req, 'bookingId'));
      sendSuccess(res, status);
    } catch (err) {
      next(err);
    }
  }

  async addQueueDelay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const { minutes } = req.body;
      const status = await queueService.applyDelay(getParam(req, 'bookingId'), minutes, req.user.buyerId);
      sendSuccess(res, status, `Added +${minutes} min gate delay`);
    } catch (err) {
      next(err);
    }
  }

  async clearQueueDelay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const status = await queueService.clearDelay(getParam(req, 'bookingId'), req.user.buyerId);
      sendSuccess(res, status, 'Gate cleared. Farmer advised to leave now.');
    } catch (err) {
      next(err);
    }
  }

  async updateDepartureState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { departure_state } = req.body;
      const status = await queueService.setDepartureState(getParam(req, 'bookingId'), departure_state);
      sendSuccess(res, status, `Departure state updated to ${departure_state}`);
    } catch (err) {
      next(err);
    }
  }

  async checkInFarmer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.farmerId) throw new UnauthorizedError();
      const status = await queueService.checkInFarmer(getParam(req, 'bookingId'), req.user.farmerId);
      sendSuccess(res, status, 'Farmer checked in successfully at Mandi gate');
    } catch (err) {
      next(err);
    }
  }

  async advanceQueue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const status = await queueService.advanceQueue(getParam(req, 'bookingId'), req.user.buyerId);
      sendSuccess(res, status, 'Queue advanced to next lot');
    } catch (err) {
      next(err);
    }
  }
}

export const queueController = new QueueController();
