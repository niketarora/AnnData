/**
 * Intelligence Domain Types & Interfaces
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Phase 3 Intelligence Layer
 */

export type IngestionRunStatus = 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
export type DataFreshnessStatus = 'LIVE' | 'RECENT' | 'STALE' | 'UNAVAILABLE';
export type ModelRegistryStatus = 'ACTIVE' | 'DISABLED' | 'RETIRED';
export type FactorImpact = 'positive' | 'negative' | 'neutral';
export type IntelligenceAction = 'SELL_NOW' | 'WAIT' | 'PARTIAL_SELL';

export interface DataSource {
  id: string;
  name: string;
  type: string;
  base_url: string;
  active: boolean;
  refresh_interval_seconds: number;
  last_success_at?: string;
  last_failure_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DataIngestionRun {
  id: string;
  source_id: string;
  started_at: string;
  completed_at?: string;
  status: IngestionRunStatus;
  records_received: number;
  records_inserted: number;
  records_updated: number;
  records_rejected: number;
  error_message?: string;
  created_at: string;
}

export interface ExternalDataRecord {
  id: string;
  source_id: string;
  entity_type: string;
  entity_id: string;
  source_record_id?: string;
  observed_at: string;
  received_at: string;
  expires_at: string;
  provider_version: string;
  ingestion_status: DataFreshnessStatus;
  raw_payload?: Record<string, unknown>;
  normalized_payload: Record<string, unknown>;
  created_at: string;
}

export interface DataFreshness {
  id: string;
  entity_type: string;
  entity_id: string;
  status: DataFreshnessStatus;
  last_observed_at: string;
  last_synced_at: string;
  expires_at: string;
  source_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ModelRegistryEntry {
  id: string;
  model_name: string;
  version: string;
  provider: string;
  input_schema_version: string;
  output_schema_version: string;
  status: ModelRegistryStatus;
  created_at: string;
  retired_at?: string;
}

export interface PredictionRun {
  id: string;
  model_id: string;
  entity_type: string;
  entity_id: string;
  request_hash: string;
  started_at: string;
  completed_at?: string;
  status: string;
  latency_ms: number;
  error_code?: string;
  created_at: string;
}

export interface PredictionInputSnapshot {
  id: string;
  prediction_run_id: string;
  schema_version: string;
  input_hash: string;
  input_json: Record<string, unknown>;
  created_at: string;
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
  value_json: PriceForecastValue | Record<string, unknown>;
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
  created_at: string;
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

export interface DecisionEvent {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  recommendation_id?: string;
  model_version: string;
  input_snapshot_reference?: string;
  decision: IntelligenceAction;
  score: number;
  confidence: number | null;
  created_at: string;
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

// ==========================================
// ML Service Contracts (Shared Specification)
// ==========================================
export interface PricePredictionRequest {
  date: string;
  state: string;
  district: string;
  marketCode: string;
  crop: string;
  variety: string;
  historicalModalPrice: number;
  arrivalsQuintals?: number;
  temperatureCelsius?: number;
  rainfallMm?: number;
  humidityPercent?: number;
  msp?: number;
}

export interface PricePredictionResponse {
  predictedPrice1d: number;
  predictedPrice3d: number;
  predictedPrice7d: number;
  confidence: number;
  modelVersion: string;
  generatedAt: string;
}

export interface QualityAssessmentRequest {
  crop: string;
  variety: string;
  imageUrls: string[];
}

export interface QualityAssessmentResponse {
  qualityScore: number;
  predictedGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Rejection';
  confidence: number;
  moisturePercent: number;
  damagePercent: number;
  uniformityScore: number;
  foreignMatterPercent: number;
  modelVersion: string;
  generatedAt: string;
}

export interface SellingRecommendationRequest {
  lotId: string;
  crop: string;
  variety: string;
  quantityQuintals: number;
  qualityScore: number;
  predictedGrade: string;
  candidateMarkets: Array<{
    marketId: string;
    currentPrice: number;
    distanceKm: number;
    waitMinutes: number;
    activeCounters: number;
    buyerReliabilityScore: number;
  }>;
}

export interface SellingRecommendationResponse {
  primaryAction: 'SELL_NOW' | 'WAIT' | 'PARTIAL_SELL';
  confidence: number;
  reason: string;
  rankedMarkets: Array<{
    marketId: string;
    grossRevenue: number;
    estimatedTransportCost: number;
    estimatedNetRealization: number;
    recommendationScore: number;
    rank: number;
    explanation: string;
  }>;
  modelVersion: string;
  generatedAt: string;
}

