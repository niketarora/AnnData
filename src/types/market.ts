export interface MandiFacility {
  name: string;
  available: boolean;
  icon: string;
}

export interface Market {
  id: string;
  name: string;
  location: string;
  distanceKm: number;
  transitMinutes: number;
  grossPricePerQuintal: number;
  expectedNetPayout: number;
  netRatePerQuintal: number;
  transportCost: number;
  mandiCessDeduction: number;
  gateWaitingMinutes: number;
  queueCongestion: 'Low' | 'Moderate' | 'High';
  openDemandQuintals: number;
  dailySlotsRemaining: number;
  isRecommended: boolean;
  recommendationReason: string;
  facilities: MandiFacility[];
  operatingHours: string;
  coordinates?: { latitude: number; longitude: number };
}

export interface MarketDemand {
  id: string;
  buyerId: string;
  buyerName: string;
  mandiName: string;
  crop: string;
  variety: string;
  minimumGrade: string;
  requiredQuantityQuintals: number;
  fulfilledQuantityQuintals: number;
  minPrice: number;
  maxPrice: number;
  targetDate: string;
  dailyCapacity: number;
  assignedCounter: string;
  paymentTerms: string;
  status: 'ACTIVE' | 'PAUSED' | 'FULFILLED';
}

export interface Recommendation {
  action: 'SELL_NOW' | 'WAIT' | 'PARTIAL_SELL';
  actionTitle: string;
  actionSubtitle: string;
  recommendedMarketId: string;
  recommendedMarketName: string;
  expectedRealization: number;
  marketPriceRange: string;
  sevenDayTrendPercent: number;
  rationale: string;
  sellPercent?: number;
  holdPercent?: number;
}
