/**
 * Data Freshness Tracking Service
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 7 & 35: Data Freshness Lifecycle and Stale Threshold Engine
 */

import {
  DataFreshness,
  DataFreshnessStatus,
} from '../../types/intelligence.types.js';
import { freshnessRepository } from '../../repositories/intelligenceRepositories.js';
import { eventBus } from '../../events/eventEmitter.js';

export class FreshnessService {
  private readonly LIVE_THRESHOLD_MS = 15 * 60 * 1000; // 15 mins
  private readonly RECENT_THRESHOLD_MS = 60 * 60 * 1000; // 60 mins

  /**
   * Evaluates freshness status from an observed timestamp
   */
  public evaluateStatus(observedAtIso: string): DataFreshnessStatus {
    const observedTime = new Date(observedAtIso).getTime();
    if (isNaN(observedTime)) return 'UNAVAILABLE';

    const ageMs = Date.now() - observedTime;
    if (ageMs < 0) return 'LIVE'; // clock skew / current batch
    if (ageMs <= this.LIVE_THRESHOLD_MS) return 'LIVE';
    if (ageMs <= this.RECENT_THRESHOLD_MS) return 'RECENT';
    return 'STALE';
  }

  /**
   * Gets or computes data freshness for an entity
   */
  public async getEntityFreshness(entityType: string, entityId: string): Promise<DataFreshness> {
    const record = await freshnessRepository.getStatus(entityType, entityId);
    if (!record) {
      return {
        id: `fresh-${Date.now()}`,
        entity_type: entityType,
        entity_id: entityId,
        status: 'UNAVAILABLE',
        last_observed_at: new Date(0).toISOString(),
        last_synced_at: new Date(0).toISOString(),
        expires_at: new Date(0).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // Recalculate dynamic status based on current time
    const currentStatus = this.evaluateStatus(record.last_observed_at);
    if (currentStatus !== record.status) {
      const updated = await freshnessRepository.upsert({
        entity_type: entityType,
        entity_id: entityId,
        status: currentStatus,
        last_observed_at: record.last_observed_at,
        last_synced_at: record.last_synced_at,
        expires_at: record.expires_at,
        source_id: record.source_id,
      });

      if (currentStatus === 'STALE') {
        eventBus.emit('external_data.stale', { entityType, entityId, lastObservedAt: record.last_observed_at });
      }

      return updated;
    }

    return record;
  }

  /**
   * Updates freshness after a successful data synchronization
   */
  public async recordObservation(
    entityType: string,
    entityId: string,
    observedAtIso: string,
    sourceId?: string
  ): Promise<DataFreshness> {
    const status = this.evaluateStatus(observedAtIso);
    const expiresAt = new Date(new Date(observedAtIso).getTime() + this.RECENT_THRESHOLD_MS).toISOString();

    const saved = await freshnessRepository.upsert({
      entity_type: entityType,
      entity_id: entityId,
      status,
      last_observed_at: observedAtIso,
      last_synced_at: new Date().toISOString(),
      expires_at: expiresAt,
      source_id: sourceId,
    });

    eventBus.emit('external_data.updated', { entityType, entityId, status, observedAt: observedAtIso });
    return saved;
  }

  /**
   * Scans all freshness records and flags any newly stale entities
   */
  public async scanAndMarkStale(): Promise<{ checked: number; newlyStale: number }> {
    const all = await freshnessRepository.getAll();
    let newlyStale = 0;

    for (const item of all) {
      if (item.status === 'LIVE' || item.status === 'RECENT') {
        const evalStatus = this.evaluateStatus(item.last_observed_at);
        if (evalStatus === 'STALE') {
          await freshnessRepository.upsert({
            ...item,
            status: 'STALE',
          });
          newlyStale++;
          eventBus.emit('external_data.stale', {
            entityType: item.entity_type,
            entityId: item.entity_id,
            lastObservedAt: item.last_observed_at,
          });
        }
      }
    }

    return { checked: all.length, newlyStale };
  }
}

export const freshnessService = new FreshnessService();
