/**
 * Prediction Provider Interface
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 6 & 24: ML Adapter Architecture
 */

import {
  PricePredictionRequest,
  PricePredictionResponse,
  SellingRecommendationRequest,
  SellingRecommendationResponse,
  QualityAssessmentRequest,
  QualityAssessmentResponse,
} from '../../types/intelligence.types.js';

export interface MLProviderHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  latencyMs: number;
  lastChecked: string;
  modelVersion: string;
  message?: string;
}

export interface PredictionProvider {
  readonly providerName: string;
  getModelVersion(modelType: 'price' | 'selling' | 'quality'): string;
  predictPrice(request: PricePredictionRequest): Promise<{ data: PricePredictionResponse; latencyMs: number }>;
  recommendSelling(request: SellingRecommendationRequest): Promise<{ data: SellingRecommendationResponse; latencyMs: number }>;
  assessQuality(request: QualityAssessmentRequest): Promise<{ data: QualityAssessmentResponse; latencyMs: number }>;
  health(): Promise<MLProviderHealth>;
}
