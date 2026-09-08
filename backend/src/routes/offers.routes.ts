import { Router } from 'express';
import { offersController } from '../controllers/offers.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createOfferSchema } from '../schemas/index.js';

export const offersRoutes = Router();

offersRoutes.use(requireAuth);

offersRoutes.get('/booking/:bookingId', offersController.getByBookingId);
offersRoutes.get('/:id', offersController.getById);

// Buyer creates binding offer
offersRoutes.post(
  '/',
  requireRole('buyer', 'operator'),
  validate({ body: createOfferSchema }),
  offersController.createOffer
);

// Farmer accepts or rejects offer
offersRoutes.post('/:id/accept', requireRole('farmer'), offersController.acceptOffer);
offersRoutes.post('/:id/reject', requireRole('farmer'), offersController.rejectOffer);
