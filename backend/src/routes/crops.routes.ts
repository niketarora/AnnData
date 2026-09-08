import { Router } from 'express';
import { cropsController } from '../controllers/crops.controller.js';

export const cropsRoutes = Router();

cropsRoutes.get('/', cropsController.getAllCrops);
cropsRoutes.get('/:id', cropsController.getCropById);
