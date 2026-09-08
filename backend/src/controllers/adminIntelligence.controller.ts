/**
 * Admin & Operator Intelligence Diagnostics Controller
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 49: Admin Diagnostics (Secrets Isolated)
 */

import { Request, Response, NextFunction } from 'express';
import { runProviderHealthJob } from '../jobs/providerHealth.job.js';
import {
  dataSourcesRepository,
  modelRegistryRepository,
  ingestionRunsRepository,
} from '../repositories/intelligenceRepositories.js';
import { getMarketDataProvider } from '../integrations/market/index.js';
import { getPredictionProvider } from '../integrations/ml/index.js';

export class AdminIntelligenceController {
  async getHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const healthReport = await runProviderHealthJob();
      res.status(200).json({
        success: true,
        data: healthReport,
      });
    } catch (err) {
      next(err);
    }
  }

  async getProviders(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const marketProvider = getMarketDataProvider();
      const mlProvider = getPredictionProvider();
      const sources = await dataSourcesRepository.findAll();

      // Ensure no secrets are leaked
      const sanitizedSources = sources.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        baseUrl: s.base_url,
        active: s.active,
        refreshInterval: s.refresh_interval_seconds,
        lastSuccessAt: s.last_success_at,
        lastFailureAt: s.last_failure_at,
      }));

      res.status(200).json({
        success: true,
        data: {
          activeMarketProvider: marketProvider.providerName,
          activeMLProvider: mlProvider.providerName,
          registeredSources: sanitizedSources,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getModels(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const models = await modelRegistryRepository.findAllActive();
      res.status(200).json({
        success: true,
        data: models,
      });
    } catch (err) {
      next(err);
    }
  }

  async getIngestionRuns(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(String(req.query.limit || '20'), 10);
      const runs = await ingestionRunsRepository.listRecent(limit);
      res.status(200).json({
        success: true,
        data: runs,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const adminIntelligenceController = new AdminIntelligenceController();
