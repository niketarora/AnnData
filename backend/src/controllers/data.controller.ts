/**
 * External Data & Freshness API Controller
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 30: Data API Endpoints & Freshness Exposure
 */

import { Request, Response, NextFunction } from 'express';
import {
  externalDataRepository,
  dataSourcesRepository,
  freshnessRepository,
} from '../repositories/intelligenceRepositories.js';
import { freshnessService } from '../services/data/freshness.service.js';
import { ingestionService } from '../services/data/ingestion.service.js';
import { NotFoundError } from '../utils/errors.js';

export class DataController {
  async getEntityData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = String(req.params.entityType);
      const entityId = String(req.params.entityId);
      const record = await externalDataRepository.findLatest(entityType, entityId);
      const freshness = await freshnessService.getEntityFreshness(entityType, entityId);

      if (!record) {
        throw new NotFoundError(`No external data record found for ${entityType}:${entityId}`);
      }

      res.status(200).json({
        success: true,
        data: {
          record: record.normalized_payload,
          observedAt: record.observed_at,
          expiresAt: record.expires_at,
          source: record.source_id,
          freshness,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getSources(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sources = await dataSourcesRepository.findAll();
      res.status(200).json({
        success: true,
        data: sources,
      });
    } catch (err) {
      next(err);
    }
  }

  async getFreshness(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const freshnessList = await freshnessRepository.getAll();
      res.status(200).json({
        success: true,
        data: freshnessList,
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sourceId = req.body?.sourceId;
      const result = await ingestionService.syncMarketData(sourceId);
      res.status(200).json({
        success: result.status !== 'FAILED',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const dataController = new DataController();
