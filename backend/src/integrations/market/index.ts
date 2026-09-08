import { env } from '../../config/env.js';
import { MarketDataProvider } from './marketDataProvider.interface.js';
import { mockMarketDataProvider } from './mockMarketDataProvider.js';
import { externalMarketDataProvider } from './externalMarketDataProvider.js';

export * from './marketDataProvider.interface.js';
export * from './mockMarketDataProvider.js';
export * from './externalMarketDataProvider.js';

export function getMarketDataProvider(): MarketDataProvider {
  if (env.APP_DATA_MODE === 'production' && env.MARKET_DATA_API_KEY) {
    return externalMarketDataProvider;
  }
  return mockMarketDataProvider;
}
