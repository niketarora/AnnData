/**
 * Prediction Service
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 16, 17, 24, 25 & 39: Model Client & Prediction Engine
 */

import { getPredictionProvider } from '../../integrations/ml/index.js';
import {
  predictionsRepository,
  modelRegistryRepository,
} from '../../repositories/intelligenceRepositories.js';
import { intelligenceCache } from '../cache/cache.service.js';
import {
  Prediction,
  PriceForecastValue,
  PricePredictionRequest,
} from '../../types/intelligence.types.js';
import { logger } from '../../config/logger.js';

export interface PredictPriceOptions {
  crop: string;
  variety: string;
  state: string;
  district: string;
  marketCode: string;
  historicalModalPrice: number;
  arrivalsQuintals?: number;
  temperatureCelsius?: number;
  rainfallMm?: number;
  humidityPercent?: number;
  msp?: number;
  entityId?: string;
  forceRefresh?: boolean;
}

export class PredictionService {
  /**
   * Generates or fetches a cached price prediction for a commodity and location
   */
  public async predictPrice(options: PredictPriceOptions): Promise<Prediction> {
    const provider = getPredictionProvider();
    const modelVersion = provider.getModelVersion('price');
    const entityId = options.entityId || `${options.marketCode}-${options.crop}-${options.variety}`.toLowerCase();

    // 1. Check in-memory cache
    const cacheKey = intelligenceCache.generateKey('price_forecast', entityId, modelVersion);
    const requestHash = intelligenceCache.hashInput({
      crop: options.crop,
      variety: options.variety,
      marketCode: options.marketCode,
      price: options.historicalModalPrice,
    });

    if (!options.forceRefresh) {
      const cached = intelligenceCache.get<Prediction>(cacheKey);
      if (cached) {
        return cached;
      }

      // Also check persistent predictions database
      const dbCached = await predictionsRepository.findByEntity('crop', entityId);
      if (dbCached && new Date(dbCached.expires_at) > new Date()) {
        intelligenceCache.set(cacheKey, dbCached, requestHash, modelVersion);
        return dbCached;
      }
    }

    // 2. Resolve active model from registry
    const modelEntry =
      (await modelRegistryRepository.findActive('OASSM-10-PriceTransformer')) || {
        id: 'mod-01',
        model_name: 'OASSM-10-PriceTransformer',
        version: modelVersion,
      };

    // 3. Record Prediction Run
    const run = await predictionsRepository.createRun({
      model_id: modelEntry.id,
      entity_type: 'crop',
      entity_id: entityId,
      request_hash: requestHash,
      started_at: new Date().toISOString(),
      status: 'RUNNING',
      latency_ms: 0,
    });

    // 4. Record Input Snapshot for reproducibility & audit
    await predictionsRepository.saveSnapshot({
      prediction_run_id: run.id,
      schema_version: '1.0.0',
      input_hash: requestHash,
      input_json: options as unknown as Record<string, unknown>,
    });

    const requestPayload: PricePredictionRequest = {
      date: new Date().toISOString(),
      state: options.state,
      district: options.district,
      marketCode: options.marketCode,
      crop: options.crop,
      variety: options.variety,
      historicalModalPrice: options.historicalModalPrice,
      arrivalsQuintals: options.arrivalsQuintals,
      temperatureCelsius: options.temperatureCelsius,
      rainfallMm: options.rainfallMm,
      humidityPercent: options.humidityPercent,
      msp: options.msp,
    };

    try {
      // 5. Execute ML inference via provider adapter
      const { data, latencyMs } = await provider.predictPrice(requestPayload);

      const generatedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour TTL
      const trendPercent = Number(
        (((data.predictedPrice7d - options.historicalModalPrice) / options.historicalModalPrice) * 100).toFixed(1)
      );

      const forecastValue: PriceForecastValue = {
        predictedPrice1d: data.predictedPrice1d,
        predictedPrice3d: data.predictedPrice3d,
        predictedPrice7d: data.predictedPrice7d,
        baselineModalPrice: options.historicalModalPrice,
        expectedPriceRange: `₹${data.predictedPrice1d.toLocaleString('en-IN')} - ₹${data.predictedPrice7d.toLocaleString('en-IN')}`,
        sevenDayTrendPercent: trendPercent,
        predictionInterval: {
          lowerBound: Math.round(data.predictedPrice1d * 0.96),
          upperBound: Math.round(data.predictedPrice7d * 1.04),
        },
      };

      // 6. Persist Prediction
      const savedPrediction = await predictionsRepository.savePrediction({
        prediction_run_id: run.id,
        entity_type: 'crop',
        entity_id: entityId,
        prediction_type: 'price_forecast',
        value_json: forecastValue,
        confidence: data.confidence,
        model_version: data.modelVersion,
        generated_at: generatedAt,
        expires_at: expiresAt,
        status: 'ACTIVE',
      });

      // 7. Store in cache
      intelligenceCache.set(cacheKey, savedPrediction, requestHash, modelVersion);

      logger.info(
        { entityId, modelVersion, latencyMs },
        'Price prediction generated and persisted'
      );

      return savedPrediction;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error({ error: message, entityId }, 'ML price prediction failed');

      // Do NOT fabricate random values (Section 25: Never random value)
      throw new Error(`ML Price Prediction Service Failure: ${message}`);
    }
  }
}

export const predictionService = new PredictionService();
