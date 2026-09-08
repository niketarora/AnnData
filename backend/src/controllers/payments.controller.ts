import { Request, Response, NextFunction } from 'express';
import { paymentsService } from '../services/payments.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';
import { getParam } from '../utils/params.js';

export class PaymentsController {
  async getPaymentByTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentsService.getPaymentByTransaction(getParam(req, 'transactionId'));
      sendSuccess(res, payment);
    } catch (err) {
      next(err);
    }
  }

  async releasePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || !req.user.buyerId) throw new UnauthorizedError();
      const txn = await paymentsService.releasePayment(getParam(req, 'transactionId'), req.user.buyerId);
      sendSuccess(res, txn, 'Payment released via Direct Benefit Transfer');
    } catch (err) {
      next(err);
    }
  }
}

export const paymentsController = new PaymentsController();
