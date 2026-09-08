import { Router } from 'express';
import { grievancesController } from '../controllers/grievances.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createGrievanceSchema, resolveGrievanceSchema } from '../schemas/index.js';

export const grievancesRoutes = Router();

grievancesRoutes.use(requireAuth);

grievancesRoutes.get('/', grievancesController.getGrievances);
grievancesRoutes.get('/:id', grievancesController.getGrievanceById);
grievancesRoutes.post('/', validate({ body: createGrievanceSchema }), grievancesController.fileGrievance);
grievancesRoutes.patch(
  '/:id/resolve',
  requireRole('operator'),
  validate({ body: resolveGrievanceSchema }),
  grievancesController.resolveGrievance
);
