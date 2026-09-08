import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EligibilityRules } from '../src/rules/eligibility.rules.js';
import { ThresholdRules } from '../src/rules/threshold.rules.js';
import { RiskRules } from '../src/rules/risk.rules.js';
import { scoringService } from '../src/services/intelligence/scoring.service.js';

describe('8. Business Rules Precedence & Multi-Factor Scoring Engine', () => {
  it('enforces that hard eligibility rules cannot be bypassed by ML', () => {
    // Non-farmer / unauthenticated role
    const nonFarmerCheck = EligibilityRules.evaluateAll({
      userId: 'test-user',
      role: 'buyer', // buyer attempting to request selling advice
      cropLotStatus: 'ACTIVE',
      lotQuantityQuintals: 20,
    });
    assert.equal(nonFarmerCheck.eligible, false);
    assert.ok(nonFarmerCheck.failureReasons[0].includes('farmer'));

    // Zero quantity lot
    const zeroQtyCheck = EligibilityRules.evaluateAll({
      userId: 'test-user',
      role: 'farmer',
      cropLotStatus: 'ACTIVE',
      lotQuantityQuintals: 0,
    });
    assert.equal(zeroQtyCheck.eligible, false);
    assert.ok(zeroQtyCheck.failureReasons[0].includes('greater than zero'));
  });

  it('enforces Government Minimum Support Price (MSP) price floor benchmarks', () => {
    // Wheat MSP benchmark is ₹2,275/QTL
    const belowMspCheck = ThresholdRules.evaluate({
      crop: 'Wheat',
      proposedPrice: 2100, // Below MSP
      queueWaitMinutes: 20,
      activeCounters: 4,
    });
    assert.equal(belowMspCheck.passesMspFloor, false);
    assert.ok(belowMspCheck.alerts.some((a) => a.includes('below Government MSP floor')));

    const aboveMspCheck = ThresholdRules.evaluate({
      crop: 'Wheat',
      proposedPrice: 2540, // Above MSP
      queueWaitMinutes: 20,
      activeCounters: 4,
    });
    assert.equal(aboveMspCheck.passesMspFloor, true);
    assert.equal(aboveMspCheck.alerts.length, 0);
  });

  it('calculates risk penalties for perishables, heavy rainfall, and tractor distance', () => {
    const highRiskPerishable = RiskRules.evaluate({
      crop: 'Tomato',
      distanceKm: 55, // exceeds tractor radius
      vehicleType: 'Tractor Trolley',
      precipitationProbabilityPercent: 80, // Heavy rain
      mandiWaitingMinutes: 60, // Excessive wait
    });

    assert.equal(highRiskPerishable.riskLevel, 'HIGH');
    assert.ok(highRiskPerishable.riskScore >= 0.7);
    assert.ok(highRiskPerishable.warnings.length >= 2);
  });

  it('executes authoritative True Net Realization arithmetic with minor-unit accuracy', () => {
    // 20 Quintals at ₹2,540/QTL, 14 km away at ₹4.20/QTL/km, 1.5% cess, ₹12/QTL unloading
    const result = scoringService.calculateNetRealization({
      grossPricePerQuintal: 2540,
      quantityQuintals: 20,
      distanceKm: 14,
    });

    assert.equal(result.grossRevenue, 50800);
    assert.equal(result.transportCost, 1176); // 14 * 4.2 * 20
    assert.equal(result.mandiCess, 762);      // 50800 * 0.015
    assert.equal(result.unloadingCost, 240);   // 20 * 12
    assert.equal(result.netRealization, 48622);
    assert.equal(result.netRatePerQuintal, 2431);
  });

  it('proves that a closer mandi with lower gross price can yield higher net in-hand realization', () => {
    const candidates = [
      {
        marketId: 'far-mandi',
        marketName: 'Distant Mandi (Gross ₹2,580, 65 km)',
        distanceKm: 65,
        transitMinutes: 90,
        grossPricePerQuintal: 2580,
        openDemandQuintals: 400,
        gateWaitingMinutes: 70,
        buyerReliabilityScore: 90,
        activeCounters: 4,
      },
      {
        marketId: 'near-mandi',
        marketName: 'Taraori Mandi (Gross ₹2,540, 14 km)',
        distanceKm: 14,
        transitMinutes: 25,
        grossPricePerQuintal: 2540,
        openDemandQuintals: 500,
        gateWaitingMinutes: 25,
        buyerReliabilityScore: 98,
        activeCounters: 6,
      },
    ];

    const ranked = scoringService.rankMarkets(candidates, 20);

    // Near mandi must be rank 1 despite ₹40 lower gross price per quintal!
    assert.equal(ranked[0].marketId, 'near-mandi');
    assert.equal(ranked[0].rank, 1);
    assert.ok(ranked[0].estimatedNetRealization > ranked[1].estimatedNetRealization);
  });
});
