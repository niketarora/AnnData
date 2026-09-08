import { buyersRepository } from '../repositories/buyers.repository.js';
import { demandsRepository } from '../repositories/demands.repository.js';
import { lotsRepository } from '../repositories/lots.repository.js';
import { NotFoundError } from '../utils/errors.js';

export interface MatchedBuyerCandidate {
  buyerId: string;
  organizationName: string;
  marketName: string;
  matchScore: number;
  demandQuantityRemaining: number;
  indicativePriceRange: string;
  paymentReliability: number;
  activeCounters: number;
  counterId?: string;
  gate?: string;
}

export class BuyerMatchingService {
  async matchBuyersForLot(lotId: string): Promise<MatchedBuyerCandidate[]> {
    const lot = await lotsRepository.findById(lotId);
    if (!lot) throw new NotFoundError(`Crop lot not found with ID ${lotId}`);

    const buyers = await buyersRepository.findAll();
    const demands = await demandsRepository.findAll({ status: 'ACTIVE' });

    const candidates: MatchedBuyerCandidate[] = [];

    for (const buyer of buyers) {
      const buyerDemands = demands.filter((d) => d.buyer_id === buyer.id);
      const matchingDemand = buyerDemands.find(
        (d) => !lot.crop_id || d.crop_id === lot.crop_id
      ) || buyerDemands[0];

      const remainingQty = matchingDemand
        ? matchingDemand.quantity_required - matchingDemand.quantity_fulfilled
        : buyer.daily_capacity_quintals;

      const priceRange = matchingDemand
        ? `₹${matchingDemand.indicative_price_min} – ₹${matchingDemand.indicative_price_max}`
        : '₹2,480 – ₹2,560';

      const matchScore = Math.min(
        1,
        0.5 * (buyer.payment_reliability_score / 100) +
          0.3 * (remainingQty >= lot.quantity ? 1 : remainingQty / lot.quantity) +
          0.2 * 0.95
      );

      candidates.push({
        buyerId: buyer.id,
        organizationName: buyer.organization_name,
        marketName: buyer.market_name || 'Taraori APMC Mandi',
        matchScore: Math.round(matchScore * 100) / 100,
        demandQuantityRemaining: remainingQty,
        indicativePriceRange: priceRange,
        paymentReliability: buyer.payment_reliability_score,
        activeCounters: 4,
        counterId: buyer.counter_id,
        gate: buyer.mandi_gate,
      });
    }

    // Sort descending by matchScore
    candidates.sort((a, b) => b.matchScore - a.matchScore);
    return candidates;
  }
}

export const buyerMatchingService = new BuyerMatchingService();
