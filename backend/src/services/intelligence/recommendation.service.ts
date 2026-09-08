/**
 * Recommendation Service
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 18, 19, 21, 22: Explainability & Decision Recommendations Engine
 */

import {
  Recommendation,
  RecommendationFactor,
  RankedMarketOption,
  IntelligenceAction,
} from '../../types/intelligence.types.js';
import { recommendationsRepository } from '../../repositories/intelligenceRepositories.js';
import { intelligenceCache } from '../cache/cache.service.js';
import { RecommendationRules } from '../../rules/recommendation.rules.js';

export interface GenerateRecommendationOptions {
  entityType: string;
  entityId: string;
  crop: string;
  rankedMarkets: RankedMarketOption[];
  trendPercent7d: number;
  confidence: number | null;
  modelVersion: string;
  forceRefresh?: boolean;
}

export class RecommendationService {
  /**
   * Generates a fully explainable recommendation with factors
   */
  public async generateRecommendation(
    options: GenerateRecommendationOptions
  ): Promise<Recommendation> {
    const cacheKey = intelligenceCache.generateKey('recommendation', options.entityId, options.modelVersion);

    if (!options.forceRefresh) {
      const cached = intelligenceCache.get<Recommendation>(cacheKey);
      if (cached) return cached;

      const dbCached = await recommendationsRepository.findLatestByEntity(
        options.entityType,
        options.entityId
      );
      if (dbCached && new Date(dbCached.expires_at) > new Date()) {
        intelligenceCache.set(cacheKey, dbCached, 'cached', options.modelVersion);
        return dbCached;
      }
    }

    const topMarket = options.rankedMarkets[0];
    const secondMarket = options.rankedMarkets[1];
    const netSpread = secondMarket
      ? topMarket.estimatedNetRealization - secondMarket.estimatedNetRealization
      : 500;

    // Formulate Action using rules engine
    const actionResult = RecommendationRules.formulateAction({
      netRealizationSpread: netSpread,
      trendPercent7d: options.trendPercent7d,
      queueWaitMinutes: topMarket ? topMarket.gateWaitingMinutes : 30,
      isPerishable: options.crop.toLowerCase().includes('tomato'),
      isMLAvailable: true,
    });

    const generatedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min TTL

    // Build recommendation record
    const recommendation = await recommendationsRepository.saveRecommendation({
      entity_type: options.entityType,
      entity_id: options.entityId,
      recommendation_type: 'selling_decision',
      decision: actionResult.action,
      sell_percent: actionResult.sellPercent,
      hold_percent: actionResult.holdPercent,
      score: topMarket ? topMarket.recommendationScore : 0.85,
      confidence: options.confidence,
      reason: actionResult.reason,
      ranked_markets: options.rankedMarkets,
      generated_at: generatedAt,
      expires_at: expiresAt,
      model_version: options.modelVersion,
      status: 'ACTIVE',
    });

    // Derive explicit explainability factors (Section 19: Explainability Requirement)
    const factors: Array<Omit<RecommendationFactor, 'id' | 'created_at'>> = [
      {
        recommendation_id: recommendation.id,
        factor: 'Net Realization Spread',
        value: `+₹${topMarket.netGainVsLocalAvg.toLocaleString('en-IN')} vs regional average`,
        weight: 0.35,
        impact: 'positive',
        direction: 'higher_net_payout',
      },
      {
        recommendation_id: recommendation.id,
        factor: 'Mandi Gate Congestion',
        value: `${topMarket.gateWaitingMinutes} min estimated turnaround`,
        weight: 0.25,
        impact: topMarket.gateWaitingMinutes <= 35 ? 'positive' : 'negative',
        direction: topMarket.gateWaitingMinutes <= 35 ? 'rapid_throughput' : 'queue_bottleneck',
      },
      {
        recommendation_id: recommendation.id,
        factor: '7-Day Price Forecast',
        value: `+${options.trendPercent7d}% expected wholesale trend`,
        weight: 0.25,
        impact: options.trendPercent7d >= 0 ? 'positive' : 'negative',
        direction: options.trendPercent7d >= 0 ? 'bullish_outlook' : 'softening_trend',
      },
      {
        recommendation_id: recommendation.id,
        factor: 'Transport Efficiency',
        value: `${topMarket.distanceKm} km transit distance`,
        weight: 0.15,
        impact: topMarket.distanceKm <= 30 ? 'positive' : 'neutral',
        direction: 'proximity_advantage',
      },
    ];

    const savedFactors = await recommendationsRepository.saveFactors(factors);
    recommendation.factors = savedFactors;

    intelligenceCache.set(cacheKey, recommendation, 'rec-hash', options.modelVersion, 15 * 60 * 1000);

    return recommendation;
  }
}

export const recommendationService = new RecommendationService();
