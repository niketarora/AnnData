export interface MandiPriceFeed {
  marketId: string;
  marketName: string;
  cropName: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  msp: number;
  arrivalsQuintals: number;
  reportedDate: string;
  source: string;
}

export interface IMarketDataService {
  getPricesForCrop(cropName: string, state?: string): Promise<MandiPriceFeed[]>;
}

export class MarketDataService implements IMarketDataService {
  async getPricesForCrop(cropName: string, state = 'Haryana'): Promise<MandiPriceFeed[]> {
    return [
      {
        marketId: '33333333-3333-3333-3333-333333333301',
        marketName: 'Taraori APMC Mandi',
        cropName,
        variety: 'Sharbati',
        minPrice: 2480,
        maxPrice: 2560,
        modalPrice: 2520,
        msp: 2275,
        arrivalsQuintals: 450,
        reportedDate: new Date().toISOString().split('T')[0],
        source: 'AGMARKNET / data.gov.in Interface',
      },
      {
        marketId: '33333333-3333-3333-3333-333333333302',
        marketName: 'Karnal Main APMC',
        cropName,
        variety: 'Sharbati',
        minPrice: 2420,
        maxPrice: 2530,
        modalPrice: 2490,
        msp: 2275,
        arrivalsQuintals: 820,
        reportedDate: new Date().toISOString().split('T')[0],
        source: 'AGMARKNET / data.gov.in Interface',
      },
    ];
  }
}

export const marketDataService = new MarketDataService();
