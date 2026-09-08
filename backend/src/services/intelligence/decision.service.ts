/**
 * Decision Automation Engine
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 20, 21, 38 & 41: End-to-End Decision Pipeline
 */

import { EligibilityRules } from '../../rules/eligibility.rules.js';
import { ThresholdRules } from '../../rules/threshold.rules.js';
import { RiskRules } from '../../rules/risk.rules.js';
import { predictionService } from './prediction.service.js';
import { scoringService, MarketScoreCandidate } from './scoring.service.js';
import { recommendationService } from './recommendation.service.js';
import { freshnessService } from '../data/freshness.service.js';
import { decisionEventsRepository } from '../../repositories/intelligenceRepositories.js';
import {
  Recommendation,
  Prediction,
  DataFreshness,
  PriceForecastValue,
} from '../../types/intelligence.types.js';
import { memoryDb } from '../../repositories/dbStore.js';
import { eventBus } from '../../events/eventEmitter.js';

export interface EvaluateDecisionContext {
  userId: string;
  role: string;
  cropLotId: string;
  crop: string;
  variety: string;
  quantityQuintals: number;
  state?: string;
  district?: string;
  forceRefresh?: boolean;
}

export interface DecisionResult {
  eligible: boolean;
  failureReasons?: string[];
  recommendation?: Recommendation;
  prediction?: Prediction;
  freshness: DataFreshness;
  generatedAt: string;
  expiresAt: string;
}

export class DecisionService {
  /**
   * Executes the full authoritative intelligence decision pipeline
   */
  public async evaluateDecision(ctx: EvaluateDecisionContext): Promise<DecisionResult> {
    const generatedAt = new Date().toISOString();

    // 1. Security & Eligibility Precedence Check (Section 41)
    const eligibility = EligibilityRules.evaluateAll({
      userId: ctx.userId,
      role: ctx.role,
      cropLotStatus: 'ACTIVE',
      lotQuantityQuintals: ctx.quantityQuintals,
    });

    if (!eligibility.eligible) {
      const emptyFreshness: DataFreshness = {
        id: `fresh-empty`,
        entity_type: 'crop_lot',
        entity_id: ctx.cropLotId,
        status: 'UNAVAILABLE',
        last_observed_at: new Date(0).toISOString(),
        last_synced_at: new Date(0).toISOString(),
        expires_at: new Date(0).toISOString(),
        created_at: generatedAt,
        updated_at: generatedAt,
      };
      return {
        eligible: false,
        failureReasons: eligibility.failureReasons,
        freshness: emptyFreshness,
        generatedAt,
        expiresAt: generatedAt,
      };
    }

    // 2. Fetch External Data Freshness
    const freshness = await freshnessService.getEntityFreshness('crop', ctx.crop.toLowerCase());

    // 3. Assemble Candidate Mandis from Reference Data
    const markets = memoryDb.markets;
    const candidates: MarketScoreCandidate[] = markets.map((m) => {
      // Find latest price record or fallback to baseline
      const priceRecord = memoryDb.externalDataRecords.find(
        (r) => r.entity_type === 'market' && r.entity_id === m.id
      );
      const grossPrice = priceRecord
        ? Number((priceRecord.normalized_payload as { modalPricePerQuintal?: number })?.modalPricePerQuintal || 2500)
        : m.name.includes('Taraori')
        ? 2540
        : m.name.includes('Karnal')
        ? 2510
        : 2460;

      return {
        marketId: m.id,
        marketName: m.name,
        distanceKm: m.name.includes('Taraori') ? 14 : m.name.includes('Karnal') ? 22 : 38,
        transitMinutes: m.name.includes('Taraori') ? 25 : m.name.includes('Karnal') ? 35 : 55,
        grossPricePerQuintal: grossPrice,
        openDemandQuintals: 500,
        gateWaitingMinutes: m.name.includes('Taraori') ? 25 : m.name.includes('Karnal') ? 45 : 35,
        buyerReliabilityScore: 98,
        activeCounters: 6,
      };
    });

    // 4. ML Prediction: Fetch Price Forecast (Section 17)
    const baselinePrice = candidates[0]?.grossPricePerQuintal || 2500;
    const prediction = await predictionService.predictPrice({
      crop: ctx.crop,
      variety: ctx.variety,
      state: ctx.state || 'Haryana',
      district: ctx.district || 'Karnal',
      marketCode: 'MKT-B-TARAORI',
      historicalModalPrice: baselinePrice,
      entityId: ctx.cropLotId,
      forceRefresh: ctx.forceRefresh,
    });

    const forecastVal = prediction.value_json as PriceForecastValue;
    const trend7d = forecastVal?.sevenDayTrendPercent || 3.5;

    // 5. Apply Business & Threshold Rules (MSP floor check)
    const thresholdCheck = ThresholdRules.evaluate({
      crop: ctx.crop,
      proposedPrice: baselinePrice,
      queueWaitMinutes: candidates[0]?.gateWaitingMinutes || 25,
      activeCounters: 6,
    });

    // 6. Multi-Factor Scoring: Rank Mandi Options (Section 20)
    const rankedMarkets = scoringService.rankMarkets(candidates, ctx.quantityQuintals);

    // 7. Generate Explainable Recommendation (Section 21)
    const recommendation = await recommendationService.generateRecommendation({
      entityType: 'crop_lot',
      entityId: ctx.cropLotId,
      crop: ctx.crop,
      rankedMarkets,
      trendPercent7d: trend7d,
      confidence: prediction.confidence,
      modelVersion: prediction.model_version,
      forceRefresh: ctx.forceRefresh,
    });

    // 8. Persist Decision Event Audit Trail (Section 38)
    await decisionEventsRepository.create({
      user_id: ctx.userId,
      entity_type: 'crop_lot',
      entity_id: ctx.cropLotId,
      recommendation_id: recommendation.id,
      model_version: recommendation.model_version,
      decision: recommendation.decision,
      score: recommendation.score,
      confidence: recommendation.confidence,
    });

    // 9. Publish Realtime Event (Section 31)
    eventBus.emit('recommendation.updated', {
      cropLotId: ctx.cropLotId,
      decision: recommendation.decision,
      score: recommendation.score,
      timestamp: generatedAt,
    });

    return {
      eligible: true,
      recommendation,
      prediction,
      freshness,
      generatedAt,
      expiresAt: recommendation.expires_at,
    };
  }
}

export const decisionService = new DecisionService();
