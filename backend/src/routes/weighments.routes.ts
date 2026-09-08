import { Router } from 'express';
import { weighmentsController } from '../controllers/weighments.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createWeighmentSchema } from '../schemas/index.js';

export const weighmentsRoutes = Router();

weighmentsRoutes.use(requireAuth);

weighmentsRoutes.get('/booking/:bookingId', weighmentsController.getByBookingId);
weighmentsRoutes.post(
  '/',
  requireRole('buyer', 'operator'),
  validate({ body: createWeighmentSchema }),
  weighmentsController.recordWeighment
);
