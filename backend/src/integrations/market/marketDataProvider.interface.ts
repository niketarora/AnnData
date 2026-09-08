/**
 * Market Data Provider Interface
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 6: Provider Adapter Architecture
 */

export interface MarketDataRecord {
  marketId: string;
  marketCode: string;
  marketName: string;
  district: string;
  state: string;
  commodity: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalsQuintals: number;
  observedAt: string;
  source: string;
  sourceRecordId?: string;
  raw?: Record<string, unknown>;
}

export interface MarketDataFilter {
  marketId?: string;
  marketCode?: string;
  commodity?: string;
  variety?: string;
  state?: string;
  district?: string;
}

export interface ProviderHealthStatus {
  status: 'healthy' | 'degraded' | 'unavailable';
  latencyMs: number;
  lastChecked: string;
  message?: string;
}

export interface MarketDataProvider {
  readonly providerName: string;
  getCurrentData(filter: MarketDataFilter): Promise<MarketDataRecord[]>;
  getHistoricalData(filter: MarketDataFilter, windowDays: number): Promise<MarketDataRecord[]>;
  getStatus(): Promise<ProviderHealthStatus>;
  normalize(raw: unknown): MarketDataRecord[];
}
