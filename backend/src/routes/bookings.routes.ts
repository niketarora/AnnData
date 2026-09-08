import { Router } from 'express';
import { bookingsController } from '../controllers/bookings.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const bookingsRoutes = Router();

bookingsRoutes.use(requireAuth);

bookingsRoutes.get('/:id', bookingsController.getBookingById);
bookingsRoutes.post('/:id/cancel', bookingsController.cancelBooking);
