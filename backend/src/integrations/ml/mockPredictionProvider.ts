/**
 * Mock Prediction Provider
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 6 & 66: Mock ML Provider Simulation
 */

import {
  PricePredictionRequest,
  PricePredictionResponse,
  SellingRecommendationRequest,
  SellingRecommendationResponse,
  QualityAssessmentRequest,
  QualityAssessmentResponse,
} from '../../types/intelligence.types.js';
import {
  PredictionProvider,
  MLProviderHealth,
} from './predictionProvider.interface.js';

export class MockPredictionProvider implements PredictionProvider {
  public readonly providerName = 'MockOASSMAndCatBoostProvider';

  private modelVersions = {
    price: '1.2.0',
    selling: '2.1.0',
    quality: '1.0.4',
  };

  getModelVersion(modelType: 'price' | 'selling' | 'quality'): string {
    return this.modelVersions[modelType];
  }

  async predictPrice(request: PricePredictionRequest): Promise<{ data: PricePredictionResponse; latencyMs: number }> {
    const start = Date.now();
    const base = request.historicalModalPrice;

    // Deterministic simulation based on commodity & historical price
    // Seasonal uptick simulation: +1.2% at 1d, +2.8% at 3d, +4.6% at 7d
    const predicted1d = Math.round(base * 1.012);
    const predicted3d = Math.round(base * 1.028);
    const predicted7d = Math.round(base * 1.046);

    const latencyMs = Math.max(15, Date.now() - start);

    return {
      data: {
        predictedPrice1d: predicted1d,
        predictedPrice3d: predicted3d,
        predictedPrice7d: predicted7d,
        confidence: 0.88, // 88% verified algorithmic confidence
        modelVersion: this.modelVersions.price,
        generatedAt: new Date().toISOString(),
      },
      latencyMs,
    };
  }

  async recommendSelling(
    request: SellingRecommendationRequest
  ): Promise<{ data: SellingRecommendationResponse; latencyMs: number }> {
    const start = Date.now();
    const quantity = request.quantityQuintals || 20;

    // Rank candidate markets based on True Net Realization
    const ranked = request.candidateMarkets
      .map((m) => {
        const freightRatePerKm = 4.2; // ₹4.2/QTL/km
        const estimatedTransportCost = Math.round(m.distanceKm * freightRatePerKm * quantity);
        const grossRevenue = Math.round(m.currentPrice * quantity);
        const mandiCess = Math.round(grossRevenue * 0.015); // 1.5% APMC cess
        const unloadingCost = Math.round(quantity * 12); // ₹12/QTL
        const estimatedNetRealization = grossRevenue - estimatedTransportCost - mandiCess - unloadingCost;

        // Turnaround score penalizes wait times over 30 mins
        const waitPenalty = Math.max(0, (m.waitMinutes - 20) * 0.005);
        const score = Math.max(0.1, Math.min(0.99, (m.buyerReliabilityScore / 100) * 0.5 + (m.currentPrice / 3000) * 0.4 - waitPenalty));

        return {
          marketId: m.marketId,
          grossRevenue,
          estimatedTransportCost,
          estimatedNetRealization,
          recommendationScore: Number(score.toFixed(2)),
          rank: 1, // updated below
          explanation: `Yields ₹${(estimatedNetRealization / quantity).toFixed(0)}/QTL net in-hand after transit (₹${estimatedTransportCost}) and queue turnaround (${m.waitMinutes}m).`,
        };
      })
      .sort((a, b) => b.estimatedNetRealization - a.estimatedNetRealization)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    const topMarket = ranked[0];
    const secondMarket = ranked[1];
    const isSpreadHigh = secondMarket && (topMarket.estimatedNetRealization - secondMarket.estimatedNetRealization) > 1000;

    let action: 'SELL_NOW' | 'WAIT' | 'PARTIAL_SELL' = 'PARTIAL_SELL';
    let reason = 'Regional demand is firm with expected price hardening over the next 5 days. Selling a 40% lot locks immediate liquidity while holding 60% maximizes net realization.';

    if (isSpreadHigh) {
      action = 'SELL_NOW';
      reason = `${topMarket.marketId} shows exceptional immediate buyer liquidity with minimal gate waiting.`;
    }

    const latencyMs = Math.max(22, Date.now() - start);

    return {
      data: {
        primaryAction: action,
        confidence: 0.86,
        reason,
        rankedMarkets: ranked,
        modelVersion: this.modelVersions.selling,
        generatedAt: new Date().toISOString(),
      },
      latencyMs,
    };
  }

  async assessQuality(
    _request: QualityAssessmentRequest
  ): Promise<{ data: QualityAssessmentResponse; latencyMs: number }> {
    const start = Date.now();
    const latencyMs = Math.max(45, Date.now() - start);

    return {
      data: {
        qualityScore: 92,
        predictedGrade: 'Grade A',
        confidence: 0.91,
        moisturePercent: 11.8,
        damagePercent: 1.2,
        uniformityScore: 94,
        foreignMatterPercent: 0.6,
        modelVersion: this.modelVersions.quality,
        generatedAt: new Date().toISOString(),
      },
      latencyMs,
    };
  }

  async health(): Promise<MLProviderHealth> {
    return {
      status: 'healthy',
      latencyMs: 14,
      lastChecked: new Date().toISOString(),
      modelVersion: this.modelVersions.price,
      message: 'Mock ML Inference cluster active (OASSM-10 & CatBoost)',
    };
  }
}

export const mockPredictionProvider = new MockPredictionProvider();
