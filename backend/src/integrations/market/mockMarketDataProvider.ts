/**
 * Mock Market Data Provider
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 6 & 66: Demo/Mock Provider Architecture
 */

import {
  MarketDataProvider,
  MarketDataRecord,
  MarketDataFilter,
  ProviderHealthStatus,
} from './marketDataProvider.interface.js';

export class MockMarketDataProvider implements MarketDataProvider {
  public readonly providerName = 'MockHaryanaAPMCProvider';

  private mockRecords: MarketDataRecord[] = [
    {
      marketId: '33333333-3333-3333-3333-333333333301',
      marketCode: 'MKT-B-TARAORI',
      marketName: 'Taraori APMC Mandi',
      district: 'Karnal',
      state: 'Haryana',
      commodity: 'Wheat',
      variety: 'Sharbati',
      minPrice: 2420,
      maxPrice: 2580,
      modalPrice: 2510,
      arrivalsQuintals: 450,
      observedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      source: 'MockHaryanaAPMCProvider',
      sourceRecordId: 'MOCK-TAR-WHT-01',
    },
    {
      marketId: '33333333-3333-3333-3333-333333333302',
      marketCode: 'MKT-B-KARNAL',
      marketName: 'Karnal Main Yard',
      district: 'Karnal',
      state: 'Haryana',
      commodity: 'Wheat',
      variety: 'Sharbati',
      minPrice: 2400,
      maxPrice: 2600,
      modalPrice: 2530,
      arrivalsQuintals: 820,
      observedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      source: 'MockHaryanaAPMCProvider',
      sourceRecordId: 'MOCK-KAR-WHT-01',
    },
    {
      marketId: '33333333-3333-3333-3333-333333333303',
      marketCode: 'MKT-B-KURUKSHETRA',
      marketName: 'Kurukshetra Grain Market',
      district: 'Kurukshetra',
      state: 'Haryana',
      commodity: 'Wheat',
      variety: 'Sharbati',
      minPrice: 2380,
      maxPrice: 2520,
      modalPrice: 2470,
      arrivalsQuintals: 310,
      observedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
      source: 'MockHaryanaAPMCProvider',
      sourceRecordId: 'MOCK-KUR-WHT-01',
    },
    {
      marketId: '33333333-3333-3333-3333-333333333301',
      marketCode: 'MKT-B-TARAORI',
      marketName: 'Taraori APMC Mandi',
      district: 'Karnal',
      state: 'Haryana',
      commodity: 'Paddy',
      variety: 'Basmati 1121',
      minPrice: 3850,
      maxPrice: 4200,
      modalPrice: 4050,
      arrivalsQuintals: 680,
      observedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      source: 'MockHaryanaAPMCProvider',
      sourceRecordId: 'MOCK-TAR-PDY-01',
    },
    {
      marketId: '33333333-3333-3333-3333-333333333301',
      marketCode: 'MKT-B-TARAORI',
      marketName: 'Taraori APMC Mandi',
      district: 'Karnal',
      state: 'Haryana',
      commodity: 'Mustard',
      variety: 'Black Mustard',
      minPrice: 5300,
      maxPrice: 5650,
      modalPrice: 5480,
      arrivalsQuintals: 210,
      observedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      source: 'MockHaryanaAPMCProvider',
      sourceRecordId: 'MOCK-TAR-MST-01',
    },
  ];

  async getCurrentData(filter: MarketDataFilter): Promise<MarketDataRecord[]> {
    return this.mockRecords.filter((rec) => {
      if (filter.marketId && rec.marketId !== filter.marketId) return false;
      if (filter.marketCode && rec.marketCode !== filter.marketCode) return false;
      if (filter.commodity && rec.commodity.toLowerCase() !== filter.commodity.toLowerCase()) return false;
      if (filter.variety && rec.variety.toLowerCase() !== filter.variety.toLowerCase()) return false;
      if (filter.district && rec.district.toLowerCase() !== filter.district.toLowerCase()) return false;
      return true;
    });
  }

  async getHistoricalData(filter: MarketDataFilter, windowDays: number = 7): Promise<MarketDataRecord[]> {
    const baseRecords = await this.getCurrentData(filter);
    const history: MarketDataRecord[] = [];

    for (let day = 1; day <= windowDays; day++) {
      const pastDate = new Date(Date.now() - day * 24 * 60 * 60 * 1000).toISOString();
      for (const rec of baseRecords) {
        // Deterministic daily variance of -1.5% to +1.5%
        const dayFactor = 1 + (Math.sin(day * 1.7) * 0.015);
        history.push({
          ...rec,
          modalPrice: Math.round(rec.modalPrice * dayFactor),
          minPrice: Math.round(rec.minPrice * dayFactor),
          maxPrice: Math.round(rec.maxPrice * dayFactor),
          arrivalsQuintals: Math.round(rec.arrivalsQuintals * (0.85 + Math.cos(day) * 0.15)),
          observedAt: pastDate,
          sourceRecordId: `${rec.sourceRecordId}-HIST-D${day}`,
        });
      }
    }

    return history;
  }

  async getStatus(): Promise<ProviderHealthStatus> {
    return {
      status: 'healthy',
      latencyMs: 12,
      lastChecked: new Date().toISOString(),
      message: 'Mock APMC data feed online and synchronized',
    };
  }

  normalize(raw: unknown): MarketDataRecord[] {
    if (Array.isArray(raw)) {
      return raw as MarketDataRecord[];
    }
    return [];
  }
}

export const mockMarketDataProvider = new MockMarketDataProvider();
