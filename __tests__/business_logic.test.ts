import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatRupee, parseRupee } from '../src/utils/currency';
import { calculateNetRealization } from '../src/utils/realization';
import { calculateQueueEstimate, formatMinutes } from '../src/utils/queue';
import { mockStore } from '../src/store/mockStore';

describe('1. Currency & Financial Display Utility', () => {
  it('formats Indian rupee amounts with symbol and commas without spaces', () => {
    const formatted = formatRupee(48654.5);
    assert.ok(formatted.startsWith('₹'));
    assert.ok(formatted.includes('48,655') || formatted.includes('48,654.50'));
  });

  it('handles zero and negative amounts gracefully', () => {
    assert.equal(formatRupee(0), '₹0');
  });

  it('parses formatted rupee strings back to numerical values', () => {
    assert.equal(parseRupee('₹48,654.50'), 48654.5);
    assert.equal(parseRupee('₹2,500'), 2500);
  });
});

describe('2. True Net Realization & Mandi Recommendation Logic', () => {
  it('correctly calculates net realization after freight, mandi cess, and unloading charges', () => {
    // 20 Quintals at ₹2,520/QTL, 18km distance at ₹40/km, APMC fee 1.5%, unloading ₹300
    const result = calculateNetRealization({
      grossPricePerQuintal: 2520,
      quantityQuintals: 20,
      distanceKm: 18,
      freightRatePerKm: 40,
      mandiFeePercent: 1.5,
      handlingFeeFlat: 300,
    });

    const expectedGross = 20 * 2520; // ₹50,400
    const expectedFreight = 18 * 40; // ₹720
    const expectedMandiFee = 50400 * 0.015; // ₹756
    const expectedHandling = 300; // ₹300
    const expectedNet = expectedGross - expectedFreight - expectedMandiFee - expectedHandling; // ₹48,624

    assert.equal(result.grossAmount, expectedGross);
    assert.equal(result.freightCost, expectedFreight);
    assert.equal(result.mandiFee, expectedMandiFee);
    assert.equal(result.handlingFee, expectedHandling);
    assert.equal(result.netPayout, expectedNet);
    assert.equal(result.netRatePerQuintal, Math.round(expectedNet / 20));
  });

  it('proves that a closer mandi with slightly lower rate can yield higher net realization', () => {
    // Mandi A (Far): ₹2,550/QTL, 65km distance, freight ₹2,600
    const farMandi = calculateNetRealization({
      grossPricePerQuintal: 2550,
      quantityQuintals: 20,
      distanceKm: 65,
      freightRatePerKm: 40,
      mandiFeePercent: 1.5,
      handlingFeeFlat: 300,
    });

    // Mandi B (Near - Taraori): ₹2,520/QTL, 18km distance, freight ₹720
    const nearMandi = calculateNetRealization({
      grossPricePerQuintal: 2520,
      quantityQuintals: 20,
      distanceKm: 18,
      freightRatePerKm: 40,
      mandiFeePercent: 1.5,
      handlingFeeFlat: 300,
    });

    // Net payout at Near Mandi (₹48,624) vs Far Mandi (₹47,335)
    assert.ok(
      nearMandi.netPayout > farMandi.netPayout,
      `Near mandi net (₹${nearMandi.netPayout}) should exceed far mandi net (₹${farMandi.netPayout})`
    );
  });
});

describe('3. Queue Velocity & Turnaround Timing', () => {
  it('formats minute durations clearly for operational gate passes', () => {
    assert.equal(formatMinutes(45), '45 min');
    assert.equal(formatMinutes(90), '1h 30m');
  });

  it('estimates queue wait time based on lots ahead and throughput speed', () => {
    const estimate = calculateQueueEstimate({
      lotsAhead: 4,
      avgMinutesPerLot: 12,
      delayMinutes: 15,
    });

    // 4 * 12 + 15 = 63 minutes
    assert.equal(estimate.totalEstimatedMinutes, 63);
    assert.equal(estimate.formattedTime, '1h 3m');
  });
});

describe('4. Mock Store End-to-End Persona Synchronization', () => {
  it('initializes with deterministic seed state for Farmer and Buyer', () => {
    mockStore.resetScenario();
    const state = mockStore.getState();

    assert.equal(state.currentRole, 'FARMER');
    assert.equal(state.farmer.name, 'Rajesh Kumar');
    assert.equal(state.activeLotId, 'lot-wh-098');
    assert.equal(state.queue.departureState, 'WAIT');
    assert.equal(state.lots.length, 2);
  });

  it('simulates Buyer adding queue delay (+20m) and Farmer receiving alert', () => {
    const initialDelay = mockStore.getState().queue.delayMinutes;
    mockStore.addQueueDelay(20);

    const state = mockStore.getState();
    assert.equal(state.queue.delayMinutes, initialDelay + 20);
    assert.equal(state.queue.departureState, 'WAIT');

    // A notification should be generated for the farmer
    const latestNotif = state.notifications[0];
    assert.equal(latestNotif.recipientRole, 'FARMER');
    assert.equal(latestNotif.category, 'QUEUE');
  });

  it('simulates Buyer clearing queue delay and Farmer switching to LEAVE NOW', () => {
    mockStore.clearQueueDelay();
    const state = mockStore.getState();

    assert.equal(state.queue.delayMinutes, 0);
    assert.equal(state.queue.departureState, 'LEAVE_NOW');

    const latestNotif = state.notifications[0];
    assert.equal(latestNotif.title, 'Leave for Mandi Now!');
  });

  it('simulates Farmer check-in at gate and arrival at Bay 3', () => {
    mockStore.checkInFarmer();
    const state = mockStore.getState();

    assert.equal(state.queue.departureState, 'ARRIVED');
    assert.equal(state.queue.lotsAhead, 0);

    const activeLot = state.lots.find((l) => l.id === state.activeLotId);
    assert.equal(activeLot?.status, 'GATE_CHECKED_IN');
  });

  it('simulates physical grading verification at Bay 3', () => {
    mockStore.submitPhysicalInspection({
      physicalGrade: 'Grade A',
      moistureReading: 11.8,
      foreignMatterPercent: 0.4,
      status: 'VERIFIED',
    });

    const state = mockStore.getState();
    const activeLot = state.lots.find((l) => l.id === state.activeLotId);
    assert.equal(activeLot?.status, 'PHYSICALLY_INSPECTED');
  });

  it('simulates electronic weighbridge scale recording', () => {
    mockStore.recordWeighment({
      grossWeightKg: 5420,
      tareWeightKg: 3450,
      netWeightKg: 1970,
      netQuintals: 19.7,
      scaleSlipNumber: 'WB-2026-142',
    });

    const state = mockStore.getState();
    const activeLot = state.lots.find((l) => l.id === state.activeLotId);
    assert.equal(activeLot?.status, 'WEIGHED');
  });

  it('simulates Buyer issuing binding offer and Farmer receiving it', () => {
    mockStore.submitOffer({
      offeredPricePerQuintal: 2520,
      ratePerQuintal: 2520,
      grossAmount: 49644,
      netPayout: 48654.5,
      netQuintals: 19.7,
    });

    const state = mockStore.getState();
    const activeLot = state.lots.find((l) => l.id === state.activeLotId);
    assert.equal(activeLot?.status, 'OFFER_RECEIVED');
  });

  it('simulates Farmer accepting offer and txn moving to PROCESSING', () => {
    mockStore.acceptOffer();

    const state = mockStore.getState();
    const activeLot = state.lots.find((l) => l.id === state.activeLotId);
    assert.equal(activeLot?.status, 'OFFER_ACCEPTED');

    const txn = state.transactions.find((t) => t.bookingId === state.activeBookingId);
    assert.equal(txn?.paymentStatus, 'PROCESSING');
  });

  it('simulates Buyer releasing DBT escrow payment and issuing J-Form digital receipt', () => {
    mockStore.releasePayment();

    const state = mockStore.getState();
    const activeLot = state.lots.find((l) => l.id === state.activeLotId);
    assert.equal(activeLot?.status, 'PAID');

    const txn = state.transactions.find((t) => t.bookingId === state.activeBookingId);
    assert.equal(txn?.paymentStatus, 'PAID');
    assert.equal(txn?.receipt?.status, 'PAID');
  });

  it('allows switching operational roles and cleanly resetting the scenario', () => {
    mockStore.setRole('BUYER');
    assert.equal(mockStore.getState().currentRole, 'BUYER');

    mockStore.setRole('FARMER');
    assert.equal(mockStore.getState().currentRole, 'FARMER');

    mockStore.resetScenario();
    assert.equal(mockStore.getState().queue.departureState, 'WAIT');
    assert.equal(mockStore.getState().lots.find((l) => l.id === 'lot-wh-098')?.status, 'BOOKING_CONFIRMED');
  });
});
