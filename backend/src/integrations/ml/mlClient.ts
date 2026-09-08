/**
 * ML Integration Client (Backend Implementation)
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 24: Model Client Implementation
 */

import {
  PricePredictionRequest,
  PricePredictionResponse,
  QualityAssessmentRequest,
  QualityAssessmentResponse,
  SellingRecommendationRequest,
  SellingRecommendationResponse,
} from '../../types/intelligence.types.js';

export interface MLClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
  modelVersion?: string;
}

export interface MLInferenceResult<T> {
  data: T;
  latencyMs: number;
  modelVersion: string;
  generatedAt: string;
}

export class MLClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly errorCode?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'MLClientError';
  }
}

export class MLClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;
  private readonly modelVersion: string;

  constructor(config: MLClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs || 5000;
    this.modelVersion = config.modelVersion || '1.0.0';
  }

  public getModelVersion(): string {
    return this.modelVersion;
  }

  public async health(): Promise<{ status: 'healthy' | 'degraded' | 'unavailable'; latencyMs: number }> {
    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const latencyMs = Date.now() - startTime;
      if (res.ok) {
        return { status: 'healthy', latencyMs };
      }
      return { status: 'degraded', latencyMs };
    } catch {
      return { status: 'unavailable', latencyMs: Date.now() - startTime };
    }
  }

  public async predictPrice(
    request: PricePredictionRequest
  ): Promise<MLInferenceResult<PricePredictionResponse>> {
    this.validatePriceRequest(request);
    return this.executeInference<PricePredictionResponse>('/predict/price', request);
  }

  public async getSellingRecommendation(
    request: SellingRecommendationRequest
  ): Promise<MLInferenceResult<SellingRecommendationResponse>> {
    return this.executeInference<SellingRecommendationResponse>('/recommend/selling', request);
  }

  public async assessQuality(
    request: QualityAssessmentRequest
  ): Promise<MLInferenceResult<QualityAssessmentResponse>> {
    return this.executeInference<QualityAssessmentResponse>('/assess/quality', request);
  }

  private async executeInference<T>(endpoint: string, body: unknown): Promise<MLInferenceResult<T>> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new MLClientError(
          `ML inference failed on ${endpoint}: ${response.statusText}`,
          response.status,
          'ML_INFERENCE_ERROR',
          errPayload
        );
      }

      const data = (await response.json()) as T;
      return {
        data,
        latencyMs,
        modelVersion: this.modelVersion,
        generatedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof MLClientError) throw err;
      const message = err instanceof Error ? err.message : String(err);
      throw new MLClientError(
        `ML inference network failure: ${message}`,
        503,
        'ML_SERVICE_UNAVAILABLE',
        err
      );
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Client-Version': 'agrifintech-backend-2.0.0',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  private validatePriceRequest(request: PricePredictionRequest): void {
    if (!request.crop || !request.variety || !request.historicalModalPrice) {
      throw new MLClientError(
        'Missing required price prediction features (crop, variety, historicalModalPrice)',
        400,
        'INVALID_REQUEST_SCHEMA'
      );
    }
    if (request.historicalModalPrice < 0) {
      throw new MLClientError(
        'historicalModalPrice must be non-negative',
        400,
        'INVALID_PRICE_VALUE'
      );
    }
  }
}
