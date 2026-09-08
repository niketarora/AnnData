/**
 * External Data Ingestion Service
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 8 & 9: Ingestion Pipeline Implementation
 */

import { getMarketDataProvider } from '../../integrations/market/index.js';
import { normalizationService, NormalizedMarketRecord } from './normalization.service.js';
import { freshnessService } from './freshness.service.js';
import {
  dataSourcesRepository,
  ingestionRunsRepository,
  externalDataRepository,
} from '../../repositories/intelligenceRepositories.js';
import { logger } from '../../config/logger.js';
import { eventBus } from '../../events/eventEmitter.js';

export interface IngestionResult {
  runId: string;
  sourceId: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  recordsReceived: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsRejected: number;
  errorMessage?: string;
  durationMs: number;
}

export class IngestionService {
  /**
   * Synchronizes market data from the active provider adapter
   */
  public async syncMarketData(sourceId?: string): Promise<IngestionResult> {
    const startTime = Date.now();
    const provider = getMarketDataProvider();

    // Resolve source record
    const sources = await dataSourcesRepository.findAll();
    const source = sourceId
      ? sources.find((s) => s.id === sourceId)
      : sources.find((s) => s.type === 'mandi_prices') || sources[0];

    const actualSourceId = source?.id || 'src-01';

    // Start ingestion run record
    const run = await ingestionRunsRepository.create({
      source_id: actualSourceId,
      started_at: new Date().toISOString(),
      status: 'RUNNING',
      records_received: 0,
      records_inserted: 0,
      records_updated: 0,
      records_rejected: 0,
    });

    try {
      // 1. Fetch raw data from provider adapter
      const rawRecords = await provider.getCurrentData({});

      let insertedCount = 0;
      let rejectedCount = 0;

      // 2. Validate, Normalize & Persist
      for (const raw of rawRecords) {
        const validation = normalizationService.validate(raw);
        if (!validation.valid) {
          rejectedCount++;
          logger.warn({ errors: validation.errors, raw }, 'Rejected invalid external market record');
          continue;
        }

        const normalized: NormalizedMarketRecord = normalizationService.normalizeMarketRecord(raw);

        // Persist external data record
        await externalDataRepository.insert({
          source_id: actualSourceId,
          entity_type: 'market',
          entity_id: normalized.marketId || normalized.marketCode,
          source_record_id: normalized.sourceRecordId,
          observed_at: normalized.observedAt,
          received_at: normalized.receivedAt,
          expires_at: normalized.expiresAt,
          provider_version: '1.0.0',
          ingestion_status: freshnessService.evaluateStatus(normalized.observedAt),
          raw_payload: raw.raw || {},
          normalized_payload: normalized as unknown as Record<string, unknown>,
        });

        // Update data freshness for the market entity
        await freshnessService.recordObservation(
          'market',
          normalized.marketId || normalized.marketCode,
          normalized.observedAt,
          actualSourceId
        );

        // Also update crop entity freshness
        await freshnessService.recordObservation(
          'crop',
          normalized.commodity.toLowerCase(),
          normalized.observedAt,
          actualSourceId
        );

        insertedCount++;
      }

      // 3. Mark Source health as successful
      await dataSourcesRepository.updateHealth(actualSourceId, true);

      const status = rejectedCount > 0 && insertedCount > 0 ? 'PARTIAL' : insertedCount > 0 ? 'SUCCESS' : 'FAILED';
      const completedAt = new Date().toISOString();

      await ingestionRunsRepository.update(run.id, {
        completed_at: completedAt,
        status,
        records_received: rawRecords.length,
        records_inserted: insertedCount,
        records_updated: 0,
        records_rejected: rejectedCount,
      });

      eventBus.emit('external_data.updated', {
        sourceId: actualSourceId,
        recordsInserted: insertedCount,
        timestamp: completedAt,
      });

      return {
        runId: run.id,
        sourceId: actualSourceId,
        status,
        recordsReceived: rawRecords.length,
        recordsInserted: insertedCount,
        recordsUpdated: 0,
        recordsRejected: rejectedCount,
        durationMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ error: message, sourceId: actualSourceId }, 'External market data ingestion failed');

      // Failure behavior: Log failure, retain last valid data, update source failure timestamp
      await dataSourcesRepository.updateHealth(actualSourceId, false);

      await ingestionRunsRepository.update(run.id, {
        completed_at: new Date().toISOString(),
        status: 'FAILED',
        error_message: message,
      });

      return {
        runId: run.id,
        sourceId: actualSourceId,
        status: 'FAILED',
        recordsReceived: 0,
        recordsInserted: 0,
        recordsUpdated: 0,
        recordsRejected: 0,
        errorMessage: message,
        durationMs: Date.now() - startTime,
      };
    }
  }
}

export const ingestionService = new IngestionService();
