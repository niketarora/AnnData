/**
 * External Market Data Provider
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 6 & 67: Production External API Provider Adapter
 */

import {
  MarketDataProvider,
  MarketDataRecord,
  MarketDataFilter,
  ProviderHealthStatus,
} from './marketDataProvider.interface.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export class ExternalMarketDataProvider implements MarketDataProvider {
  public readonly providerName = 'AgmarknetExternalProvider';
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = env.MARKET_DATA_BASE_URL;
    this.apiKey = env.MARKET_DATA_API_KEY;
  }

  async getCurrentData(filter: MarketDataFilter): Promise<MarketDataRecord[]> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('api-key', this.apiKey);
    url.searchParams.set('format', 'json');
    if (filter.state) url.searchParams.set('filters[state]', filter.state);
    if (filter.district) url.searchParams.set('filters[district]', filter.district);
    if (filter.commodity) url.searchParams.set('filters[commodity]', filter.commodity);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        logger.error({ status: res.status, url: url.toString() }, 'External market data provider HTTP error');
        throw new Error(`Provider returned status ${res.status}`);
      }

      const json = await res.json();
      return this.normalize(json);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn({ error: message }, 'External market data provider unreachable');
      throw new Error(`External market data provider failure: ${message}`);
    }
  }

  async getHistoricalData(filter: MarketDataFilter, _windowDays: number): Promise<MarketDataRecord[]> {
    // Falls back to current data if historical feed endpoint is not separately supplied
    return this.getCurrentData(filter);
  }

  async getStatus(): Promise<ProviderHealthStatus> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(this.baseUrl, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeout);
      return {
        status: res.ok ? 'healthy' : 'degraded',
        latencyMs: Date.now() - start,
        lastChecked: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'unavailable',
        latencyMs: Date.now() - start,
        lastChecked: new Date().toISOString(),
        message: 'External provider endpoint unreachable',
      };
    }
  }

  normalize(raw: unknown): MarketDataRecord[] {
    const records: MarketDataRecord[] = [];
    if (!raw || typeof raw !== 'object') return records;

    const dataObj = raw as { records?: Array<Record<string, unknown>> };
    if (!Array.isArray(dataObj.records)) return records;

    for (const item of dataObj.records) {
      if (item.commodity && item.modal_price) {
        records.push({
          marketId: String(item.market || item.market_id || 'unknown'),
          marketCode: String(item.market_code || 'APMC-EXT'),
          marketName: String(item.market || 'APMC Mandi'),
          district: String(item.district || 'Karnal'),
          state: String(item.state || 'Haryana'),
          commodity: String(item.commodity),
          variety: String(item.variety || 'Standard'),
          minPrice: Number(item.min_price || item.modal_price),
          maxPrice: Number(item.max_price || item.modal_price),
          modalPrice: Number(item.modal_price),
          arrivalsQuintals: Number(item.arrivals || 0),
          observedAt: new Date(String(item.arrival_date || Date.now())).toISOString(),
          source: this.providerName,
          sourceRecordId: String(item.id || item.record_id || ''),
          raw: item,
        });
      }
    }

    return records;
  }
}

export const externalMarketDataProvider = new ExternalMarketDataProvider();
