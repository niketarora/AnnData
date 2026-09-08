import { marketsRepository } from '../repositories/markets.repository.js';
import { Market } from '../types/index.js';
import { NotFoundError } from '../utils/errors.js';

export class MarketsService {
  async getAllMarkets(): Promise<Market[]> {
    return marketsRepository.findAll();
  }

  async getMarketById(id: string): Promise<Market> {
    const market = await marketsRepository.findById(id);
    if (!market) throw new NotFoundError(`Market not found with ID ${id}`);
    return market;
  }
}

export const marketsService = new MarketsService();
