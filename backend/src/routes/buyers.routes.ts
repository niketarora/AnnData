import { Router } from 'express';
import { buyersController } from '../controllers/buyers.controller.js';
import { demandsController } from '../controllers/demands.controller.js';
import { lotsController } from '../controllers/lots.controller.js';
import { bookingsController } from '../controllers/bookings.controller.js';
import { analyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import {
  createBuyerDemandSchema,
  updateBuyerDemandSchema,
  assignSlotSchema,
  updateBuyerSchema,
} from '../schemas/index.js';

export const buyersRoutes = Router();

// Publicly list buyers/mandis
buyersRoutes.get('/list', buyersController.getAllBuyers);

buyersRoutes.use(requireAuth);

// Buyer profile & analytics
buyersRoutes.get('/profile', requireRole('buyer', 'operator'), buyersController.getProfile);
buyersRoutes.patch('/profile', requireRole('buyer'), validate({ body: updateBuyerSchema }), buyersController.updateProfile);
buyersRoutes.get('/analytics', requireRole('buyer', 'operator'), analyticsController.getBuyerAnalytics);

// Buyer demands
buyersRoutes.get('/demands', requireRole('buyer', 'operator'), demandsController.getBuyerDemands);
buyersRoutes.post('/demands', requireRole('buyer', 'operator'), validate({ body: createBuyerDemandSchema }), demandsController.createDemand);
buyersRoutes.get('/demands/:id', demandsController.getDemandById);
buyersRoutes.patch('/demands/:id', requireRole('buyer', 'operator'), validate({ body: updateBuyerDemandSchema }), demandsController.updateDemand);
buyersRoutes.delete('/demands/:id', requireRole('buyer', 'operator'), demandsController.deleteDemand);

// Buyer incoming lots
buyersRoutes.get('/lots', requireRole('buyer', 'operator'), lotsController.getAllBuyerLots);
buyersRoutes.get('/lots/:id', requireRole('buyer', 'operator'), lotsController.getLotById);

// Buyer bookings & slot assignment
buyersRoutes.get('/bookings', requireRole('buyer', 'operator'), bookingsController.getBuyerBookings);
buyersRoutes.post('/bookings/:id/assign-slot', requireRole('buyer', 'operator'), validate({ body: assignSlotSchema }), bookingsController.assignSlotAndAccept);
buyersRoutes.post('/bookings/:id/reject', requireRole('buyer', 'operator'), bookingsController.rejectBooking);
