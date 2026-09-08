import { Router } from 'express';
import { demandsController } from '../controllers/demands.controller.js';

export const demandsRoutes = Router();

demandsRoutes.get('/', demandsController.getAllDemands);
demandsRoutes.get('/:id', demandsController.getDemandById);
