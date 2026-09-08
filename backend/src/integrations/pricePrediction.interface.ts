export interface PricePredictionInput {
  date: string;
  state: string;
  district: string;
  market: string;
  crop: string;
  variety: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrivals?: number;
  temperature?: number;
  rainfall?: number;
  humidity?: number;
  msp?: number;
  season?: string;
  demand?: number;
  supply?: number;
}

export interface PricePredictionOutput {
  predicted_price_1d: number;
  predicted_price_3d: number;
  predicted_price_7d: number;
  confidence: number;
  model_version: string;
  timestamp: string;
}

export interface IPricePredictionService {
  predictPrice(input: PricePredictionInput): Promise<PricePredictionOutput>;
}

// Concrete stub interface ready for future FastAPI ML connection
export class MLPricePredictionStubService implements IPricePredictionService {
  async predictPrice(input: PricePredictionInput): Promise<PricePredictionOutput> {
    return {
      predicted_price_1d: input.modal_price * 1.01,
      predicted_price_3d: input.modal_price * 1.025,
      predicted_price_7d: input.modal_price * 1.035,
      confidence: 0.91,
      model_version: 'OASSM-10-v2.0-STUB',
      timestamp: new Date().toISOString(),
    };
  }
}
