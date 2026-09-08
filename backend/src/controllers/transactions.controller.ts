import { Request, Response, NextFunction } from 'express';
import { transactionsService } from '../services/transactions.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';
import { getParam } from '../utils/params.js';

export class TransactionsController {
  async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const txns = await transactionsService.getTransactions(
        req.user.role,
        req.user.farmerId,
        req.user.buyerId
      );
      sendSuccess(res, txns);
    } catch (err) {
      next(err);
    }
  }

  async getTransactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const txn = await transactionsService.getTransactionById(
        getParam(req, 'id'),
        req.user.role,
        req.user.farmerId,
        req.user.buyerId
      );
      sendSuccess(res, txn);
    } catch (err) {
      next(err);
    }
  }

  async getReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const receipt = await transactionsService.getReceipt(getParam(req, 'id'));
      sendSuccess(res, receipt);
    } catch (err) {
      next(err);
    }
  }
}

export const transactionsController = new TransactionsController();
