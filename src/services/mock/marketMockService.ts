import { IMarketService } from '../interfaces/IMarketService';
import { Market, MarketDemand, Recommendation } from '../../types';
import { mockStore } from '../../store';

export class MarketMockService implements IMarketService {
  async getAvailableMarkets(): Promise<Market[]> {
    return mockStore.getState().markets;
  }

  async getMarketById(id: string): Promise<Market | undefined> {
    return mockStore.getState().markets.find((m) => m.id === id);
  }

  async getMarketRecommendation(_lotId: string): Promise<Recommendation> {
    return mockStore.getState().recommendation;
  }

  async getBuyerDemands(_mandiId?: string): Promise<MarketDemand[]> {
    return mockStore.getState().demands;
  }

  async createBuyerDemand(demand: Omit<MarketDemand, 'id' | 'fulfilledQuantityQuintals' | 'status'>): Promise<MarketDemand> {
    const newDemand: MarketDemand = {
      ...demand,
      id: `dem-${Date.now()}`,
      fulfilledQuantityQuintals: 0,
      status: 'ACTIVE',
    };
    mockStore.addDemand(newDemand);
    return newDemand;
  }
}

export const marketMockService = new MarketMockService();
