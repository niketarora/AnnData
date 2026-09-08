/**
 * Operational Threshold Rules
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 40: Minimum Support Price (MSP) Floor & Queue Wait Ceilings
 */

export interface ThresholdContext {
  crop: string;
  proposedPrice: number;
  mspFloor?: number;
  queueWaitMinutes: number;
  activeCounters: number;
}

export interface ThresholdCheckResult {
  passesMspFloor: boolean;
  isQueueAcceptable: boolean;
  mspFloor: number;
  alerts: string[];
}

export class ThresholdRules {
  // Official MSP benchmarks for Haryana reference crops (₹/Quintal)
  private static readonly MSP_FLOORS: Record<string, number> = {
    wheat: 2275,
    paddy: 2320,
    mustard: 5650,
    maize: 2090,
    cotton: 6620,
  };

  public static getMspFloor(crop: string): number {
    return this.MSP_FLOORS[crop.toLowerCase()] || 0;
  }

  public static evaluate(ctx: ThresholdContext): ThresholdCheckResult {
    const alerts: string[] = [];
    const floor = ctx.mspFloor || this.getMspFloor(ctx.crop);

    const passesMspFloor = ctx.proposedPrice >= floor;
    if (!passesMspFloor && floor > 0) {
      alerts.push(`Critical: Expected price ₹${ctx.proposedPrice}/QTL is below Government MSP floor of ₹${floor}/QTL.`);
    }

    const isQueueAcceptable = ctx.queueWaitMinutes <= 90;
    if (!isQueueAcceptable) {
      alerts.push(`High Congestion: Mandi wait time (${ctx.queueWaitMinutes}m) exceeds 90-minute operational tolerance ceiling.`);
    }

    return {
      passesMspFloor,
      isQueueAcceptable,
      mspFloor: floor,
      alerts,
    };
  }
}
