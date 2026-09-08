/**
 * Unified Intelligence Orchestrator Service
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 27: Aggregated Intelligence Bundle & Refresh API
 */

import { decisionService } from './decision.service.js';
import { freshnessService } from '../data/freshness.service.js';
import {
  predictionsRepository,
  recommendationsRepository,
} from '../../repositories/intelligenceRepositories.js';
import { FullIntelligenceBundle } from '../../types/intelligence.types.js';
import { memoryDb } from '../../repositories/dbStore.js';

export class IntelligenceService {
  /**
   * Retrieves aggregated intelligence bundle for an entity (crop lot, commodity, or market)
   */
  public async getIntelligence(
    entityType: string,
    entityId: string,
    userId: string,
    role: string
  ): Promise<FullIntelligenceBundle> {
    // 1. Check existing active recommendation and prediction
    const recommendation = await recommendationsRepository.findLatestByEntity(entityType, entityId);
    const prediction = await predictionsRepository.findByEntity(entityType, entityId);
    const freshness = await freshnessService.getEntityFreshness(entityType, entityId);

    // If both exist and are unexpired, return the bundle directly
    if (recommendation && prediction) {
      return {
        entityType,
        entityId,
        prediction,
        recommendation,
        freshness,
        factors: recommendation.factors || [],
        generatedAt: recommendation.generated_at,
        expiresAt: recommendation.expires_at,
      };
    }

    // Otherwise compute on-demand
    return this.refreshIntelligence(entityType, entityId, userId, role);
  }

  /**
   * Recalculates and refreshes the intelligence bundle
   */
  public async refreshIntelligence(
    entityType: string,
    entityId: string,
    userId: string,
    role: string
  ): Promise<FullIntelligenceBundle> {
    // Determine crop & variety context from lot or defaults
    const lot = memoryDb.cropLots.find((l) => l.id === entityId);
    const crop = memoryDb.crops.find((c) => c.id === lot?.crop_id)?.name || 'Wheat';
    const variety = lot?.variety || 'Sharbati';
    const quantity = lot?.quantity || 20;

    const decisionResult = await decisionService.evaluateDecision({
      userId,
      role,
      cropLotId: entityId,
      crop,
      variety,
      quantityQuintals: quantity,
      forceRefresh: true,
    });

    const now = new Date().toISOString();
    return {
      entityType,
      entityId,
      prediction: decisionResult.prediction || null,
      recommendation: decisionResult.recommendation || null,
      freshness: decisionResult.freshness,
      factors: decisionResult.recommendation?.factors || [],
      generatedAt: decisionResult.generatedAt || now,
      expiresAt: decisionResult.expiresAt || now,
    };
  }
}

export const intelligenceService = new IntelligenceService();
