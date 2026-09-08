/**
 * Market Data Synchronization Background Job
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 10 & 11: Scheduled Jobs with Idempotency & Error Handling
 */

import { ingestionService } from '../services/data/ingestion.service.js';
import { logger } from '../config/logger.js';

export async function runMarketSyncJob(): Promise<{ success: boolean; recordsInserted: number }> {
  logger.info('Starting scheduled marketSync job...');
  try {
    const result = await ingestionService.syncMarketData();
    logger.info(
      { runId: result.runId, status: result.status, inserted: result.recordsInserted },
      'Completed marketSync job'
    );
    return {
      success: result.status === 'SUCCESS' || result.status === 'PARTIAL',
      recordsInserted: result.recordsInserted,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ error: message }, 'marketSync job failed with unexpected error');
    return { success: false, recordsInserted: 0 };
  }
}
