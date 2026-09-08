import { Router } from 'express';
import { paymentsController } from '../controllers/payments.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const paymentsRoutes = Router();

paymentsRoutes.use(requireAuth);

paymentsRoutes.get('/transaction/:transactionId', paymentsController.getPaymentByTransaction);
paymentsRoutes.post(
  '/release/:transactionId',
  requireRole('buyer', 'operator'),
  paymentsController.releasePayment
);
