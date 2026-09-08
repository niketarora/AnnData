/**
 * Provider Health Monitor Background Job
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 10 & 50: Provider Health Tracking
 */

import { getMarketDataProvider } from '../integrations/market/index.js';
import { getPredictionProvider } from '../integrations/ml/index.js';
import { logger } from '../config/logger.js';

export interface SystemHealthReport {
  marketProvider: {
    name: string;
    status: string;
    latencyMs: number;
  };
  mlProvider: {
    name: string;
    status: string;
    latencyMs: number;
    modelVersion: string;
  };
  timestamp: string;
}

export async function runProviderHealthJob(): Promise<SystemHealthReport> {
  logger.debug('Pinging provider health endpoints...');
  const marketProvider = getMarketDataProvider();
  const mlProvider = getPredictionProvider();

  const [marketHealth, mlHealth] = await Promise.all([
    marketProvider.getStatus().catch((err) => ({
      status: 'unavailable' as const,
      latencyMs: 0,
      lastChecked: new Date().toISOString(),
      message: String(err),
    })),
    mlProvider.health().catch((err) => ({
      status: 'unavailable' as const,
      latencyMs: 0,
      lastChecked: new Date().toISOString(),
      modelVersion: 'unknown',
      message: String(err),
    })),
  ]);

  const report: SystemHealthReport = {
    marketProvider: {
      name: marketProvider.providerName,
      status: marketHealth.status,
      latencyMs: marketHealth.latencyMs,
    },
    mlProvider: {
      name: mlProvider.providerName,
      status: mlHealth.status,
      latencyMs: mlHealth.latencyMs,
      modelVersion: mlHealth.modelVersion,
    },
    timestamp: new Date().toISOString(),
  };

  logger.info({ report }, 'Provider health check completed');
  return report;
}
