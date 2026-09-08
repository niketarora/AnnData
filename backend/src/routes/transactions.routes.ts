import { Router } from 'express';
import { transactionsController } from '../controllers/transactions.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const transactionsRoutes = Router();

transactionsRoutes.use(requireAuth);

transactionsRoutes.get('/', transactionsController.getTransactions);
transactionsRoutes.get('/:id', transactionsController.getTransactionById);
transactionsRoutes.get('/:id/receipt', transactionsController.getReceipt);
