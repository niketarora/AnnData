import { Router } from 'express';
import { adminIntelligenceController } from '../controllers/adminIntelligence.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

export const adminIntelligenceRoutes = Router();

adminIntelligenceRoutes.get('/health', requireAuth, requireRole('operator'), (req, res, next) => {
  adminIntelligenceController.getHealth(req, res, next);
});

adminIntelligenceRoutes.get('/providers', requireAuth, requireRole('operator'), (req, res, next) => {
  adminIntelligenceController.getProviders(req, res, next);
});

adminIntelligenceRoutes.get('/models', requireAuth, requireRole('operator'), (req, res, next) => {
  adminIntelligenceController.getModels(req, res, next);
});

adminIntelligenceRoutes.get('/ingestion-runs', requireAuth, requireRole('operator'), (req, res, next) => {
  adminIntelligenceController.getIngestionRuns(req, res, next);
});
