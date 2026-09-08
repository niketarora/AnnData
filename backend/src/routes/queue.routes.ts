import { Router } from 'express';
import { queueController } from '../controllers/queue.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { queueDelaySchema, updateDepartureStateSchema } from '../schemas/index.js';

export const queueRoutes = Router();

queueRoutes.use(requireAuth);

// Farmer & Buyer can query queue status
queueRoutes.get('/:bookingId', queueController.getQueueStatus);

// Farmer check in
queueRoutes.post('/:bookingId/check-in', requireRole('farmer'), queueController.checkInFarmer);

// Buyer / Operator delay controls
queueRoutes.post('/:bookingId/delay', requireRole('buyer', 'operator'), validate({ body: queueDelaySchema }), queueController.addQueueDelay);
queueRoutes.post('/:bookingId/clear-delay', requireRole('buyer', 'operator'), queueController.clearQueueDelay);
queueRoutes.post('/:bookingId/departure-state', validate({ body: updateDepartureStateSchema }), queueController.updateDepartureState);
queueRoutes.post('/:bookingId/advance', requireRole('buyer', 'operator'), queueController.advanceQueue);
