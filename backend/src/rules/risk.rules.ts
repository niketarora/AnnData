/**
 * Risk Assessment Rules
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 40: Perishability, Weather, and Transit Risk Engine
 */

export interface RiskContext {
  crop: string;
  distanceKm: number;
  vehicleType?: string;
  precipitationProbabilityPercent?: number;
  mandiWaitingMinutes?: number;
}

export interface RiskEvaluation {
  riskScore: number; // 0.00 (low) to 1.00 (extreme)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  perishabilityPenalty: number;
  weatherPenalty: number;
  transitPenalty: number;
  warnings: string[];
}

export class RiskRules {
  private static readonly PERISHABLE_CROPS = ['tomato', 'potato', 'onion', 'vegetables', 'fruits'];

  public static evaluate(ctx: RiskContext): RiskEvaluation {
    const warnings: string[] = [];
    let perishabilityPenalty = 0;
    let weatherPenalty = 0;
    let transitPenalty = 0;

    const isPerishable = this.PERISHABLE_CROPS.includes(ctx.crop.toLowerCase());

    // 1. Perishability & Mandi Waiting Risk
    if (isPerishable) {
      perishabilityPenalty = 0.35;
      if (ctx.mandiWaitingMinutes && ctx.mandiWaitingMinutes > 45) {
        perishabilityPenalty += 0.25;
        warnings.push('High spoilage risk: Perishable crop with yard queue wait > 45 minutes.');
      }
    }

    // 2. Weather & Rainfall Transit Risk
    if (ctx.precipitationProbabilityPercent && ctx.precipitationProbabilityPercent > 60) {
      weatherPenalty = 0.20;
      warnings.push(`Inclement weather: ${ctx.precipitationProbabilityPercent}% rain probability during transit window.`);
    }

    // 3. Transit Distance Bounds
    const maxTractorRadiusKm = 40;
    const isTractor = !ctx.vehicleType || ctx.vehicleType.toLowerCase().includes('tractor');
    if (isTractor && ctx.distanceKm > maxTractorRadiusKm) {
      transitPenalty = 0.20;
      warnings.push(`Transit warning: ${ctx.distanceKm} km exceeds standard 40 km tractor-trolley operational range.`);
    }

    const totalRisk = Math.min(1.0, perishabilityPenalty + weatherPenalty + transitPenalty);
    const riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' =
      totalRisk >= 0.6 ? 'HIGH' : totalRisk >= 0.3 ? 'MEDIUM' : 'LOW';

    return {
      riskScore: Number(totalRisk.toFixed(2)),
      riskLevel,
      perishabilityPenalty,
      weatherPenalty,
      transitPenalty,
      warnings,
    };
  }
}
