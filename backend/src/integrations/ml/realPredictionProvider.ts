/**
 * Real Prediction Provider
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 6 & 24: Remote ML Inference Server Adapter
 */

import {
  PricePredictionRequest,
  PricePredictionResponse,
  SellingRecommendationRequest,
  SellingRecommendationResponse,
  QualityAssessmentRequest,
  QualityAssessmentResponse,
} from '../../types/intelligence.types.js';
import {
  PredictionProvider,
  MLProviderHealth,
} from './predictionProvider.interface.js';
import { MLClient } from './mlClient.js';
import { env } from '../../config/env.js';

export class RealPredictionProvider implements PredictionProvider {
  public readonly providerName = 'FastAPIMLProvider';
  private client: MLClient;

  constructor() {
    this.client = new MLClient({
      baseUrl: env.ML_SERVICE_URL,
      apiKey: env.ML_SERVICE_KEY,
      timeoutMs: 5000,
    });
  }

  getModelVersion(_modelType: 'price' | 'selling' | 'quality'): string {
    return this.client.getModelVersion();
  }

  async predictPrice(request: PricePredictionRequest): Promise<{ data: PricePredictionResponse; latencyMs: number }> {
    const result = await this.client.predictPrice(request);
    return { data: result.data, latencyMs: result.latencyMs };
  }

  async recommendSelling(
    request: SellingRecommendationRequest
  ): Promise<{ data: SellingRecommendationResponse; latencyMs: number }> {
    const result = await this.client.getSellingRecommendation(request);
    return { data: result.data, latencyMs: result.latencyMs };
  }

  async assessQuality(
    request: QualityAssessmentRequest
  ): Promise<{ data: QualityAssessmentResponse; latencyMs: number }> {
    const result = await this.client.assessQuality(request);
    return { data: result.data, latencyMs: result.latencyMs };
  }

  async health(): Promise<MLProviderHealth> {
    const healthResult = await this.client.health();
    return {
      status: healthResult.status,
      latencyMs: healthResult.latencyMs,
      lastChecked: new Date().toISOString(),
      modelVersion: this.client.getModelVersion(),
    };
  }
}

export const realPredictionProvider = new RealPredictionProvider();
