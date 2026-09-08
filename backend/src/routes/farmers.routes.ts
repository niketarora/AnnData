import { Router } from 'express';
import { farmersController } from '../controllers/farmers.controller.js';
import { lotsController } from '../controllers/lots.controller.js';
import { bookingsController } from '../controllers/bookings.controller.js';
import { analyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import {
  createCropLotSchema,
  updateCropLotSchema,
  addLotImagesSchema,
  createBookingSchema,
  updateFarmerSchema,
} from '../schemas/index.js';

export const farmersRoutes = Router();

farmersRoutes.use(requireAuth);

// Farmer profile
farmersRoutes.get('/profile', requireRole('farmer'), farmersController.getProfile);
farmersRoutes.patch('/profile', requireRole('farmer'), validate({ body: updateFarmerSchema }), farmersController.updateProfile);
farmersRoutes.get('/analytics', requireRole('farmer'), analyticsController.getFarmerAnalytics);

// Farmer crop lots
farmersRoutes.get('/lots', requireRole('farmer'), lotsController.getFarmerLots);
farmersRoutes.post('/lots', requireRole('farmer'), validate({ body: createCropLotSchema }), lotsController.createLot);
farmersRoutes.get('/lots/:id', requireRole('farmer'), lotsController.getLotById);
farmersRoutes.patch('/lots/:id', requireRole('farmer'), validate({ body: updateCropLotSchema }), lotsController.updateLot);
farmersRoutes.post('/lots/:id/images', requireRole('farmer'), validate({ body: addLotImagesSchema }), lotsController.addLotImages);
farmersRoutes.get('/lots/:id/recommendations', requireRole('farmer'), lotsController.getRecommendations);
farmersRoutes.get('/lots/:id/matched-buyers', requireRole('farmer'), lotsController.getMatchedBuyers);

// Farmer bookings
farmersRoutes.get('/bookings', requireRole('farmer'), bookingsController.getFarmerBookings);
farmersRoutes.post('/bookings', requireRole('farmer'), validate({ body: createBookingSchema }), bookingsController.createBooking);
farmersRoutes.get('/bookings/:id', requireRole('farmer'), bookingsController.getBookingById);
farmersRoutes.post('/bookings/:id/cancel', requireRole('farmer'), bookingsController.cancelBooking);
