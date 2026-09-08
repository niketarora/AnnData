import { env } from '../../config/env.js';
import { PredictionProvider } from './predictionProvider.interface.js';
import { mockPredictionProvider } from './mockPredictionProvider.js';
import { realPredictionProvider } from './realPredictionProvider.js';

export * from './predictionProvider.interface.js';
export * from './mockPredictionProvider.js';
export * from './realPredictionProvider.js';

export function getPredictionProvider(): PredictionProvider {
  if (env.APP_DATA_MODE === 'production' && env.ML_SERVICE_URL && !env.ML_SERVICE_URL.includes('localhost')) {
    return realPredictionProvider;
  }
  return mockPredictionProvider;
}
