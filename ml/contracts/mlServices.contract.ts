/**
 * ML Service Contracts & Typed Interfaces
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 */

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
