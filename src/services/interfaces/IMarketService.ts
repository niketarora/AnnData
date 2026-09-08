import { Market, MarketDemand, Recommendation } from '../../types';

export interface IMarketService {
  getAvailableMarkets(): Promise<Market[]>;
  getMarketById(id: string): Promise<Market | undefined>;
  getMarketRecommendation(lotId: string): Promise<Recommendation>;
  getBuyerDemands(mandiId?: string): Promise<MarketDemand[]>;
  createBuyerDemand(demand: Omit<MarketDemand, 'id' | 'fulfilledQuantityQuintals' | 'status'>): Promise<MarketDemand>;
}
