/**
 * Frontend Intelligence Types
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Phase 3 Client Domain Models
 */

export type DataFreshnessStatus = 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
export type IntelligenceAction = 'SELL_NOW' | 'WAIT' | 'PARTIAL_SELL';
export type FactorImpact = 'positive' | 'negative' | 'neutral';

export interface DataFreshness {
  id: string;
  entity_type: string;
  entity_id: string;
  status: DataFreshnessStatus;
  last_observed_at: string;
  last_synced_at: string;
  expires_at: string;
  source_id?: string;
}

export interface PriceForecastValue {
  predictedPrice1d: number;
  predictedPrice3d: number;
  predictedPrice7d: number;
  baselineModalPrice: number;
  expectedPriceRange: string;
  sevenDayTrendPercent: number;
  predictionInterval: {
    lowerBound: number;
    upperBound: number;
  };
}

export interface Prediction {
  id: string;
  prediction_run_id: string;
  entity_type: string;
  entity_id: string;
  prediction_type: string;
  value_json: PriceForecastValue;
  confidence: number | null;
  model_version: string;
  generated_at: string;
  expires_at: string;
  status: string;
}

export interface RecommendationFactor {
  id: string;
  recommendation_id: string;
  factor: string;
  value: string;
  weight: number;
  impact: FactorImpact;
  direction: string;
}

export interface RankedMarketOption {
  marketId: string;
  marketName: string;
  distanceKm: number;
  transitMinutes: number;
  grossPricePerQuintal: number;
  grossRevenue: number;
  estimatedTransportCost: number;
  estimatedMandiCess: number;
  estimatedNetRealization: number;
  netGainVsLocalAvg: number;
  gateWaitingMinutes: number;
  recommendationScore: number;
  rank: number;
  explanation: string;
}

export interface Recommendation {
  id: string;
  entity_type: string;
  entity_id: string;
  recommendation_type: string;
  decision: IntelligenceAction;
  sell_percent?: number;
  hold_percent?: number;
  score: number;
  confidence: number | null;
  reason: string;
  ranked_markets?: RankedMarketOption[];
  factors?: RecommendationFactor[];
  generated_at: string;
  expires_at: string;
  model_version: string;
  status: string;
}

export interface FullIntelligenceBundle {
  entityType: string;
  entityId: string;
  prediction: Prediction | null;
  recommendation: Recommendation | null;
  freshness: DataFreshness;
  factors: RecommendationFactor[];
  generatedAt: string;
  expiresAt: string;
}
