/**
 * Prediction Refresh Background Job
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 10 & 45: Background Recalculation & Warmup
 */

import { predictionService } from '../services/intelligence/prediction.service.js';
import { memoryDb } from '../repositories/dbStore.js';
import { logger } from '../config/logger.js';

export async function runPredictionRefreshJob(): Promise<{ refreshed: number; failed: number }> {
  logger.info('Starting predictionRefresh background job...');
  let refreshed = 0;
  let failed = 0;

  // Recalculate price forecast for primary reference commodities
  const commodities = ['Wheat', 'Paddy', 'Mustard'];

  for (const crop of commodities) {
    try {
      await predictionService.predictPrice({
        crop,
        variety: crop === 'Wheat' ? 'Sharbati' : crop === 'Paddy' ? 'Basmati 1121' : 'Black Mustard',
        state: 'Haryana',
        district: 'Karnal',
        marketCode: 'MKT-B-TARAORI',
        historicalModalPrice: crop === 'Wheat' ? 2510 : crop === 'Paddy' ? 4050 : 5480,
        forceRefresh: true,
      });
      refreshed++;
    } catch (err: unknown) {
      failed++;
      logger.warn({ crop, error: String(err) }, 'predictionRefresh failed for commodity');
    }
  }

  logger.info({ refreshed, failed }, 'Completed predictionRefresh job');
  return { refreshed, failed };
}
