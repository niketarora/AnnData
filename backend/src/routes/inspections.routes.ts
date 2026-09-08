import { Router } from 'express';
import { inspectionsController } from '../controllers/inspections.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createInspectionSchema } from '../schemas/index.js';

export const inspectionsRoutes = Router();

inspectionsRoutes.use(requireAuth);

inspectionsRoutes.get('/booking/:bookingId', inspectionsController.getByBookingId);
inspectionsRoutes.post(
  '/',
  requireRole('buyer', 'operator'),
  validate({ body: createInspectionSchema }),
  inspectionsController.submitInspection
);
