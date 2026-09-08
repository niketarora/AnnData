import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { predictionService } from '../src/services/intelligence/prediction.service.js';
import { decisionService } from '../src/services/intelligence/decision.service.js';
import {
  predictionsRepository,
  recommendationsRepository,
  decisionEventsRepository,
} from '../src/repositories/intelligenceRepositories.js';
import { PriceForecastValue } from '../src/types/intelligence.types.js';

describe('9. ML Prediction, Explainable Recommendations & Decision Engine', () => {
  it('generates price predictions with confidence, intervals, and model version', async () => {
    const pred = await predictionService.predictPrice({
      crop: 'Wheat',
      variety: 'Sharbati',
      state: 'Haryana',
      district: 'Karnal',
      marketCode: 'MKT-B-TARAORI',
      historicalModalPrice: 2510,
      forceRefresh: true,
    });

    assert.ok(pred.id);
    assert.equal(pred.prediction_type, 'price_forecast');
    assert.equal(pred.model_version, '1.2.0');
    assert.ok(pred.confidence !== null && pred.confidence > 0.8);

    const val = pred.value_json as PriceForecastValue;
    assert.ok(val.predictedPrice1d >= 2510);
    assert.ok(val.predictedPrice3d >= val.predictedPrice1d);
    assert.ok(val.predictedPrice7d >= val.predictedPrice3d);
    assert.ok(val.predictionInterval.lowerBound < val.predictionInterval.upperBound);
  });

  it('persists prediction input snapshots and executes cache retrieval by request hash', async () => {
    const pred1 = await predictionService.predictPrice({
      crop: 'Paddy',
      variety: 'Basmati 1121',
      state: 'Haryana',
      district: 'Karnal',
      marketCode: 'MKT-B-TARAORI',
      historicalModalPrice: 4050,
      forceRefresh: true,
    });

    // Second call without forceRefresh must return cached instance
    const pred2 = await predictionService.predictPrice({
      crop: 'Paddy',
      variety: 'Basmati 1121',
      state: 'Haryana',
      district: 'Karnal',
      marketCode: 'MKT-B-TARAORI',
      historicalModalPrice: 4050,
      forceRefresh: false,
    });

    assert.equal(pred1.id, pred2.id);
  });

  it('generates explainable recommendations answering What, Why, and Influencing Factors', async () => {
    const result = await decisionService.evaluateDecision({
      userId: '00000000-0000-0000-0000-000000000001',
      role: 'farmer',
      cropLotId: 'test-wheat-lot-01',
      crop: 'Wheat',
      variety: 'Sharbati',
      quantityQuintals: 20,
      forceRefresh: true,
    });

    assert.equal(result.eligible, true);
    assert.ok(result.recommendation);
    assert.ok(result.prediction);

    const rec = result.recommendation;
    assert.ok(['SELL_NOW', 'WAIT', 'PARTIAL_SELL'].includes(rec.decision));
    assert.ok(rec.reason && rec.reason.length > 20);
    assert.ok(rec.confidence !== null && rec.confidence > 0);
    assert.ok(rec.ranked_markets && rec.ranked_markets.length >= 2);

    // Section 19 & 21: Verify contributing explainability factors exist
    assert.ok(rec.factors && rec.factors.length >= 3);
    assert.ok(rec.factors.some((f) => f.factor.includes('Net Realization')));
    assert.ok(rec.factors.some((f) => f.factor.includes('Congestion') || f.factor.includes('Queue')));

    // Section 38: Verify material decision audit event was recorded
    const events = await decisionEventsRepository.findByUser('00000000-0000-0000-0000-000000000001');
    assert.ok(events.length > 0);
    assert.equal(events[0].entity_id, 'test-wheat-lot-01');
  });

  it('enforces 15-minute recommendation expiry and 60-minute prediction expiry', async () => {
    const result = await decisionService.evaluateDecision({
      userId: '00000000-0000-0000-0000-000000000001',
      role: 'farmer',
      cropLotId: 'test-wheat-lot-02',
      crop: 'Wheat',
      variety: 'Sharbati',
      quantityQuintals: 20,
      forceRefresh: true,
    });

    const recGenerated = new Date(result.recommendation!.generated_at).getTime();
    const recExpires = new Date(result.recommendation!.expires_at).getTime();
    const recDiffMinutes = Math.round((recExpires - recGenerated) / 60000);
    assert.equal(recDiffMinutes, 15);

    const predGenerated = new Date(result.prediction!.generated_at).getTime();
    const predExpires = new Date(result.prediction!.expires_at).getTime();
    const predDiffMinutes = Math.round((predExpires - predGenerated) / 60000);
    assert.equal(predDiffMinutes, 60);
  });
});
