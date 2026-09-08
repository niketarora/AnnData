import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizationService } from '../src/services/data/normalization.service.js';
import { freshnessService } from '../src/services/data/freshness.service.js';
import { ingestionService } from '../src/services/data/ingestion.service.js';
import { externalDataRepository, freshnessRepository } from '../src/repositories/intelligenceRepositories.js';

describe('7. Intelligence Data Pipeline & Freshness Lifecycle', () => {
  it('normalizes raw market data to standard units (INR/QTL, Quintals)', () => {
    const raw = {
      marketId: 'mkt-test-1',
      marketCode: 'mkt-b-taraori',
      marketName: ' Taraori APMC Mandi ',
      district: 'Karnal',
      state: 'Haryana',
      commodity: 'Wheat',
      variety: 'Sharbati',
      minPrice: 2400,
      maxPrice: 2600,
      modalPrice: 2520,
      arrivalsQuintals: 450,
      observedAt: new Date().toISOString(),
      source: 'MockProvider',
    };

    const normalized = normalizationService.normalizeMarketRecord(raw);

    assert.equal(normalized.marketName, 'Taraori APMC Mandi');
    assert.equal(normalized.marketCode, 'MKT-B-TARAORI');
    assert.equal(normalized.modalPricePerQuintal, 2520);
    assert.equal(normalized.arrivalsQuintals, 450);
    assert.ok(normalized.expiresAt > normalized.observedAt);
  });

  it('rejects impossible and malformed records during validation', () => {
    const invalidNegative = {
      marketId: 'mkt-1',
      marketCode: 'MKT-1',
      marketName: 'Yard 1',
      district: 'Karnal',
      state: 'Haryana',
      commodity: 'Wheat',
      variety: 'Standard',
      minPrice: -100,
      maxPrice: 2000,
      modalPrice: -50,
      arrivalsQuintals: 100,
      observedAt: new Date().toISOString(),
      source: 'Test',
    };

    const check = normalizationService.validate(invalidNegative);
    assert.equal(check.valid, false);
    assert.ok(check.errors.some((e) => e.includes('positive')));
  });

  it('evaluates data freshness: LIVE (<15m), RECENT (15-60m), and STALE (>60m)', () => {
    const now = Date.now();
    const liveTime = new Date(now - 5 * 60 * 1000).toISOString(); // 5m ago
    const recentTime = new Date(now - 35 * 60 * 1000).toISOString(); // 35m ago
    const staleTime = new Date(now - 90 * 60 * 1000).toISOString(); // 90m ago

    assert.equal(freshnessService.evaluateStatus(liveTime), 'LIVE');
    assert.equal(freshnessService.evaluateStatus(recentTime), 'RECENT');
    assert.equal(freshnessService.evaluateStatus(staleTime), 'STALE');
  });

  it('synchronizes market data through the ingestion pipeline and updates freshness', async () => {
    const result = await ingestionService.syncMarketData('src-01');

    assert.ok(result.status === 'SUCCESS' || result.status === 'PARTIAL');
    assert.ok(result.recordsInserted > 0);

    const latest = await externalDataRepository.findLatest('market', '33333333-3333-3333-3333-333333333301');
    assert.ok(latest);
    assert.equal(latest?.entity_type, 'market');

    const freshness = await freshnessService.getEntityFreshness('crop', 'wheat');
    assert.ok(freshness);
    assert.ok(freshness.status === 'LIVE' || freshness.status === 'RECENT');
  });

  it('scanAndMarkStale detects and flags expired records without fabricating values', async () => {
    // Upsert an old record (2 hours ago)
    const oldTimestamp = new Date(Date.now() - 120 * 60 * 1000).toISOString();
    await freshnessRepository.upsert({
      entity_type: 'market',
      entity_id: 'old-test-market',
      status: 'LIVE',
      last_observed_at: oldTimestamp,
      last_synced_at: oldTimestamp,
      expires_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    });

    const result = await freshnessService.scanAndMarkStale();
    assert.ok(result.checked > 0);

    const check = await freshnessRepository.getStatus('market', 'old-test-market');
    assert.equal(check?.status, 'STALE');
  });
});
