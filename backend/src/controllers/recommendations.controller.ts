/**
 * Recommendation API Controller
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 29: Recommendation API Endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { recommendationsRepository } from '../repositories/intelligenceRepositories.js';
import { decisionService } from '../services/intelligence/decision.service.js';
import { memoryDb } from '../repositories/dbStore.js';
import { NotFoundError } from '../utils/errors.js';

export class RecommendationsController {
  async getByEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = String(req.params.entityType);
      const entityId = String(req.params.entityId);
      let rec = await recommendationsRepository.findLatestByEntity(entityType, entityId);

      if (!rec) {
        // Auto-generate if missing
        const lot = memoryDb.cropLots.find((l) => l.id === entityId);
        const cropName = memoryDb.crops.find((c) => c.id === lot?.crop_id)?.name || 'Wheat';
        const result = await decisionService.evaluateDecision({
          userId: req.user?.profileId || '00000000-0000-0000-0000-000000000001',
          role: req.user?.role || 'farmer',
          cropLotId: entityId,
          crop: cropName,
          variety: lot?.variety || 'Sharbati',
          quantityQuintals: lot?.quantity || 20,
        });
        rec = result.recommendation || null;
      }

      if (!rec) {
        throw new NotFoundError(`No recommendation available for ${entityType}:${entityId}`);
      }

      res.status(200).json({
        success: true,
        data: rec,
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshByEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = String(req.params.entityType);
      const entityId = String(req.params.entityId);
      const lot = memoryDb.cropLots.find((l) => l.id === entityId);
      const cropName = memoryDb.crops.find((c) => c.id === lot?.crop_id)?.name || 'Wheat';

      const result = await decisionService.evaluateDecision({
        userId: req.user?.profileId || '00000000-0000-0000-0000-000000000001',
        role: req.user?.role || 'farmer',
        cropLotId: entityId,
        crop: cropName,
        variety: lot?.variety || 'Sharbati',
        quantityQuintals: lot?.quantity || 20,
        forceRefresh: true,
      });

      if (!result.recommendation) {
        throw new NotFoundError(`Could not generate recommendation for ${entityType}:${entityId}`);
      }

      res.status(200).json({
        success: true,
        data: result.recommendation,
      });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const rec = await recommendationsRepository.findById(id);
      if (!rec) {
        throw new NotFoundError(`Recommendation not found with id: ${id}`);
      }

      res.status(200).json({
        success: true,
        data: rec,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const recommendationsController = new RecommendationsController();
