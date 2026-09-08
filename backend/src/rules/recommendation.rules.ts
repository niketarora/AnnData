/**
 * Recommendation Rules Engine
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 25 & 40: Action Mapping and Deterministic ML Fallback
 */

import { IntelligenceAction } from '../types/intelligence.types.js';

export interface ActionFormulationContext {
  netRealizationSpread: number; // Top mandi net payout minus second best
  trendPercent7d: number;       // Forecasted 7-day price growth percentage
  queueWaitMinutes: number;     // Waiting time at top mandi
  isPerishable: boolean;
  isMLAvailable: boolean;
}

export interface ActionFormulationResult {
  action: IntelligenceAction;
  sellPercent: number;
  holdPercent: number;
  reason: string;
  isFallback: boolean;
}

export class RecommendationRules {
  public static formulateAction(ctx: ActionFormulationContext): ActionFormulationResult {
    // 1. Perishable crops require immediate unloading
    if (ctx.isPerishable) {
      return {
        action: 'SELL_NOW',
        sellPercent: 100,
        holdPercent: 0,
        reason: 'Perishable crop requiring immediate sale to preserve freshness and grade realization.',
        isFallback: !ctx.isMLAvailable,
      };
    }

    // 2. Strong local mandi premium and clear queue
    if (ctx.netRealizationSpread >= 800 && ctx.queueWaitMinutes <= 35) {
      return {
        action: 'SELL_NOW',
        sellPercent: 100,
        holdPercent: 0,
        reason: 'Optimal realization spread detected at target yard with minimal queue delay.',
        isFallback: !ctx.isMLAvailable,
      };
    }

    // 3. Significant upward price trend forecasted over next 7 days
    if (ctx.trendPercent7d >= 3.0) {
      return {
        action: 'PARTIAL_SELL',
        sellPercent: 40,
        holdPercent: 60,
        reason: `Regional wholesale price outlook is hardening (+${ctx.trendPercent7d}% over 7 days). Liquidate 40% now for immediate cash flow while holding 60% for higher expected price realization.`,
        isFallback: !ctx.isMLAvailable,
      };
    }

    // 4. Heavy congestion at yard with flat trend
    if (ctx.queueWaitMinutes > 60) {
      return {
        action: 'WAIT',
        sellPercent: 0,
        holdPercent: 100,
        reason: 'Mandi yard is severely congested. Hold departure until current queue bottleneck clears.',
        isFallback: !ctx.isMLAvailable,
      };
    }

    // Default balanced recommendation
    return {
      action: 'PARTIAL_SELL',
      sellPercent: 50,
      holdPercent: 50,
      reason: 'Balanced sell-hold allocation to hedge short-term mandi arrival fluctuations.',
      isFallback: !ctx.isMLAvailable,
    };
  }
}
