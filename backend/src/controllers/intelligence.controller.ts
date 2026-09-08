/**
 * Unified Intelligence Controller
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 27: Aggregated Intelligence Bundle Controller
 */

import { Request, Response, NextFunction } from 'express';
import { intelligenceService } from '../services/intelligence/intelligence.service.js';

export class IntelligenceController {
  async getBundle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = String(req.params.entityType);
      const entityId = String(req.params.entityId);
      const userId = req.user?.profileId || '00000000-0000-0000-0000-000000000001';
      const role = req.user?.role || 'farmer';

      const bundle = await intelligenceService.getIntelligence(entityType, entityId, userId, role);
      res.status(200).json({
        success: true,
        data: bundle,
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshBundle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = String(req.params.entityType);
      const entityId = String(req.params.entityId);
      const userId = req.user?.profileId || '00000000-0000-0000-0000-000000000001';
      const role = req.user?.role || 'farmer';

      const bundle = await intelligenceService.refreshIntelligence(entityType, entityId, userId, role);
      res.status(200).json({
        success: true,
        data: bundle,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const intelligenceController = new IntelligenceController();
