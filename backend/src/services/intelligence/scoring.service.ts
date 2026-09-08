/**
 * Multi-Factor Scoring Service
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 20 & 37: True Net Realization & Multi-Factor Scoring Engine
 */

import { RankedMarketOption } from '../../types/intelligence.types.js';

export interface MarketScoreCandidate {
  marketId: string;
  marketName: string;
  distanceKm: number;
  transitMinutes: number;
  grossPricePerQuintal: number;
  openDemandQuintals: number;
  gateWaitingMinutes: number;
  buyerReliabilityScore: number;
  activeCounters: number;
}

export interface CalculateNetRealizationInput {
  grossPricePerQuintal: number;
  quantityQuintals: number;
  distanceKm: number;
  freightRatePerKm?: number;
  mandiCessPercent?: number;
  unloadingRatePerQuintal?: number;
}

export class ScoringService {
  private readonly DEFAULT_FREIGHT_RATE = 4.2; // ₹4.20 per quintal per km
  private readonly DEFAULT_MANDI_CESS = 0.015;  // 1.5% APMC market cess
  private readonly DEFAULT_UNLOADING_FEE = 12.0; // ₹12 per quintal unloading charge

  /**
   * Authoritative financial arithmetic for True Net Realization
   */
  public calculateNetRealization(input: CalculateNetRealizationInput): {
    grossRevenue: number;
    transportCost: number;
    mandiCess: number;
    unloadingCost: number;
    netRealization: number;
    netRatePerQuintal: number;
  } {
    const qty = Math.max(1, input.quantityQuintals);
    const freightRate = input.freightRatePerKm || this.DEFAULT_FREIGHT_RATE;
    const cessRate = input.mandiCessPercent !== undefined ? input.mandiCessPercent / 100 : this.DEFAULT_MANDI_CESS;
    const unloadingRate = input.unloadingRatePerQuintal || this.DEFAULT_UNLOADING_FEE;

    const grossRevenue = Math.round(input.grossPricePerQuintal * qty);
    const transportCost = Math.round(input.distanceKm * freightRate * qty);
    const mandiCess = Math.round(grossRevenue * cessRate);
    const unloadingCost = Math.round(qty * unloadingRate);

    const netRealization = grossRevenue - transportCost - mandiCess - unloadingCost;
    const netRatePerQuintal = Math.round(netRealization / qty);

    return {
      grossRevenue,
      transportCost,
      mandiCess,
      unloadingCost,
      netRealization,
      netRatePerQuintal,
    };
  }

  /**
   * Scores and ranks alternative mandis considering net payout, wait time, and buyer reliability
   */
  public rankMarkets(
    candidates: MarketScoreCandidate[],
    quantityQuintals: number = 20
  ): RankedMarketOption[] {
    if (!candidates.length) return [];

    // 1. Calculate net realization for each
    const options = candidates.map((m) => {
      const netCalc = this.calculateNetRealization({
        grossPricePerQuintal: m.grossPricePerQuintal,
        quantityQuintals,
        distanceKm: m.distanceKm,
      });

      // Composite score weighting:
      // - 50% Net price attractiveness (relative to ₹2500 benchmark)
      // - 30% Queue velocity penalty (penalize waits over 30 mins)
      // - 20% Buyer payment reliability
      const priceFactor = Math.min(1.0, netCalc.netRatePerQuintal / 2600);
      const queuePenalty = Math.max(0, (m.gateWaitingMinutes - 20) * 0.005);
      const reliabilityFactor = m.buyerReliabilityScore / 100;

      const score = Math.max(
        0.1,
        Math.min(0.99, priceFactor * 0.5 + reliabilityFactor * 0.3 - queuePenalty + (m.openDemandQuintals > 300 ? 0.05 : 0))
      );

      return {
        marketId: m.marketId,
        marketName: m.marketName,
        distanceKm: m.distanceKm,
        transitMinutes: m.transitMinutes,
        grossPricePerQuintal: m.grossPricePerQuintal,
        grossRevenue: netCalc.grossRevenue,
        estimatedTransportCost: netCalc.transportCost,
        estimatedMandiCess: netCalc.mandiCess,
        estimatedNetRealization: netCalc.netRealization,
        netGainVsLocalAvg: 0, // computed below
        gateWaitingMinutes: m.gateWaitingMinutes,
        recommendationScore: Number(score.toFixed(2)),
        rank: 1,
        explanation: '',
      };
    });

    // Sort descending by net realization
    options.sort((a, b) => b.estimatedNetRealization - a.estimatedNetRealization);

    const avgNet = options.reduce((sum, o) => sum + o.estimatedNetRealization, 0) / options.length;

    return options.map((opt, idx) => {
      const netGain = Math.round(opt.estimatedNetRealization - avgNet);
      const perQtlGain = Math.round(netGain / quantityQuintals);
      return {
        ...opt,
        rank: idx + 1,
        netGainVsLocalAvg: netGain,
        explanation:
          idx === 0
            ? `Top recommendation: Highest in-hand payout of ₹${opt.estimatedNetRealization.toLocaleString('en-IN')} (+₹${perQtlGain}/QTL vs regional average) with ~${opt.gateWaitingMinutes}m queue turnaround.`
            : `Alternative option: ₹${opt.estimatedNetRealization.toLocaleString('en-IN')} net after ₹${opt.estimatedTransportCost} freight.`,
      };
    });
  }
}

export const scoringService = new ScoringService();
