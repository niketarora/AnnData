/**
 * Recommendation Refresh Background Job
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 10 & 45: Dynamic Intelligence Recalculation
 */

import { decisionService } from '../services/intelligence/decision.service.js';
import { memoryDb } from '../repositories/dbStore.js';
import { logger } from '../config/logger.js';

export async function runRecommendationRefreshJob(): Promise<{ refreshed: number }> {
  logger.info('Starting recommendationRefresh background job for active crop lots...');
  let refreshed = 0;

  const activeLots = memoryDb.cropLots.filter(
    (l) => l.status === 'READY' || l.status === 'BOOKING_REQUESTED' || l.status === 'BOOKED'
  );

  for (const lot of activeLots) {
    try {
      const cropName = memoryDb.crops.find((c) => c.id === lot.crop_id)?.name || 'Wheat';
      await decisionService.evaluateDecision({
        userId: '00000000-0000-0000-0000-000000000001',
        role: 'farmer',
        cropLotId: lot.id,
        crop: cropName,
        variety: lot.variety || 'Sharbati',
        quantityQuintals: lot.quantity,
        forceRefresh: true,
      });
      refreshed++;
    } catch (err: unknown) {
      logger.warn({ lotId: lot.id, error: String(err) }, 'Failed to refresh recommendation for lot');
    }
  }

  logger.info({ refreshed }, 'Completed recommendationRefresh job');
  return { refreshed };
}
