/**
 * Data Freshness Background Job
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 10 & 35: Periodic Staleness Detection
 */

import { freshnessService } from '../services/data/freshness.service.js';
import { logger } from '../config/logger.js';

export async function runFreshnessJob(): Promise<{ checked: number; newlyStale: number }> {
  logger.debug('Running dataFreshness monitor job...');
  try {
    const result = await freshnessService.scanAndMarkStale();
    if (result.newlyStale > 0) {
      logger.warn(
        { checked: result.checked, newlyStale: result.newlyStale },
        'dataFreshness job flagged newly stale records'
      );
    }
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ error: message }, 'dataFreshness job failed');
    return { checked: 0, newlyStale: 0 };
  }
}
