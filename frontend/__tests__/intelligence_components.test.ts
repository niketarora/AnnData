import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { IntelligenceFormatters } from '../src/features/intelligence/formatters/intelligenceFormatters';
import { intelligenceApi } from '../src/services/intelligenceApi';

describe('5. Intelligence Display Formatting & Fallback Integrity', () => {
  it('formats relative observation time accurately', () => {
    const now = Date.now();
    assert.equal(IntelligenceFormatters.formatRelativeTime(new Date(now).toISOString()), 'Just now');
    assert.equal(IntelligenceFormatters.formatRelativeTime(new Date(now - 10 * 60 * 1000).toISOString()), 'Updated 10m ago');
    assert.equal(IntelligenceFormatters.formatRelativeTime(new Date(now - 3 * 3600 * 1000).toISOString()), 'Updated 3h ago');
    assert.equal(IntelligenceFormatters.formatRelativeTime(undefined), 'Time unavailable');
  });

  it('handles confidence pass-through without fabricating values when confidence is null (Section 22)', () => {
    assert.equal(IntelligenceFormatters.formatConfidence(0.88), '88% Algorithmic Confidence');
    assert.equal(IntelligenceFormatters.formatConfidence(0.912), '91% Algorithmic Confidence');
    assert.equal(IntelligenceFormatters.formatConfidence(null), 'Confidence unavailable');
    assert.equal(IntelligenceFormatters.formatConfidence(undefined), 'Confidence unavailable');
    assert.equal(IntelligenceFormatters.formatConfidence(NaN), 'Confidence unavailable');
  });

  it('formats user-facing action titles for trading recommendations', () => {
    assert.equal(IntelligenceFormatters.formatActionTitle('SELL_NOW'), 'Sell Immediately');
    assert.equal(IntelligenceFormatters.formatActionTitle('PARTIAL_SELL'), 'Partial Sell & Hold');
    assert.equal(IntelligenceFormatters.formatActionTitle('WAIT'), 'Hold & Wait');
    assert.equal(IntelligenceFormatters.formatActionTitle(undefined), 'Analysis Pending');
  });

  it('formats freshness status badges with stale alerts and relative time', () => {
    assert.equal(IntelligenceFormatters.formatFreshnessLabel('LIVE'), 'LIVE MANDI FEED');
    assert.equal(IntelligenceFormatters.formatFreshnessLabel('RECENT'), 'RECENT');
    assert.ok(
      IntelligenceFormatters.formatFreshnessLabel('STALE', new Date(Date.now() - 75 * 60 * 1000).toISOString()).includes(
        'STALE • Updated 1h ago'
      )
    );
    assert.equal(IntelligenceFormatters.formatFreshnessLabel('UNAVAILABLE'), 'DATA UNAVAILABLE');
  });

  it('provides a valid and realistic fallback bundle when offline', async () => {
    const bundle = await intelligenceApi.getBundle('crop', '55555555-5555-5555-5555-555555555501');
    assert.ok(bundle);
    assert.equal(bundle.entityType, 'crop');
    assert.ok(bundle.prediction);
    assert.ok(bundle.recommendation);
    assert.ok(bundle.freshness);
    assert.ok(bundle.factors.length >= 2);
  });
});
