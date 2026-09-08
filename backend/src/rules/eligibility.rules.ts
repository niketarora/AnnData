/**
 * Eligibility Rules
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 40 & 41: Deterministic Rules Precedence over ML
 */

export interface EligibilityContext {
  userId: string;
  role: string;
  farmVerified?: boolean;
  cropLotStatus?: string;
  lotQuantityQuintals?: number;
}

export interface RuleEvaluationResult {
  passed: boolean;
  ruleName: string;
  reason?: string;
}

export class EligibilityRules {
  /**
   * Rule: User must be an authenticated farmer or operator
   */
  public static verifyUserRole(ctx: EligibilityContext): RuleEvaluationResult {
    if (ctx.role !== 'farmer' && ctx.role !== 'operator') {
      return {
        passed: false,
        ruleName: 'VERIFY_USER_ROLE',
        reason: 'Intelligence selling recommendations are restricted to verified farmers and mandi operators.',
      };
    }
    return { passed: true, ruleName: 'VERIFY_USER_ROLE' };
  }

  /**
   * Rule: Crop lot must be active and have tradeable quantity
   */
  public static verifyCropLotEligibility(ctx: EligibilityContext): RuleEvaluationResult {
    if (ctx.cropLotStatus && ctx.cropLotStatus !== 'REGISTERED' && ctx.cropLotStatus !== 'ACTIVE') {
      return {
        passed: false,
        ruleName: 'VERIFY_CROP_LOT_STATUS',
        reason: `Crop lot status is '${ctx.cropLotStatus}'. Only REGISTERED or ACTIVE lots are eligible for selling intelligence.`,
      };
    }

    if (ctx.lotQuantityQuintals !== undefined && ctx.lotQuantityQuintals <= 0) {
      return {
        passed: false,
        ruleName: 'VERIFY_LOT_QUANTITY',
        reason: 'Lot quantity must be greater than zero quintals.',
      };
    }

    return { passed: true, ruleName: 'VERIFY_CROP_LOT_STATUS' };
  }

  /**
   * Runs all eligibility rules in strict precedence order
   */
  public static evaluateAll(ctx: EligibilityContext): { eligible: boolean; failureReasons: string[] } {
    const rules = [
      this.verifyUserRole(ctx),
      this.verifyCropLotEligibility(ctx),
    ];

    const failures = rules.filter((r) => !r.passed);
    return {
      eligible: failures.length === 0,
      failureReasons: failures.map((f) => f.reason || f.ruleName),
    };
  }
}
