import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('3. Crop Lots and Demands API Lifecycle', () => {
  it('creates a new crop lot with Zod validation', async () => {
    const res = await request(app)
      .post('/api/v1/farmers/lots')
      .set('Authorization', 'Bearer farmer-demo-token')
      .send({
        crop_id: 'c0000000-0000-0000-0000-000000000001',
        variety: 'Sharbati Gold',
        quantity: 25,
        unit: 'Quintal',
        farm_location: 'Karnal Sector 14 Farm',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.variety, 'Sharbati Gold');
    assert.equal(res.body.data.quantity, 25);
    assert.equal(res.body.data.status, 'READY');
  });

  it('rejects invalid lot creation with 422 Unprocessable Entity', async () => {
    const res = await request(app)
      .post('/api/v1/farmers/lots')
      .set('Authorization', 'Bearer farmer-demo-token')
      .send({
        crop_id: 'c0000000-0000-0000-0000-000000000001',
        variety: '', // Invalid empty variety
        quantity: -10, // Invalid negative quantity
        farm_location: 'Karnal',
      });

    assert.equal(res.status, 422);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details);
  });

  it('retrieves farmer crop lots with images', async () => {
    const res = await request(app)
      .get('/api/v1/farmers/lots')
      .set('Authorization', 'Bearer farmer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length > 0);
    assert.ok(Array.isArray(res.body.data[0].images));
  });

  it('buyer creates a purchase demand order', async () => {
    const res = await request(app)
      .post('/api/v1/buyers/demands')
      .set('Authorization', 'Bearer buyer-demo-token')
      .send({
        crop_id: 'c0000000-0000-0000-0000-000000000001',
        variety: 'Sharbati',
        minimum_grade: 'Grade A',
        quantity_required: 400,
        indicative_price_min: 2490,
        indicative_price_max: 2570,
        buying_date: '2026-09-12',
        processing_counters: 4,
        payment_terms: 'Instant DBT via Escrow',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.quantity_required, 400);
    assert.equal(res.body.data.status, 'ACTIVE');
  });

  it('calculates net realization and recommendation decision for a lot', async () => {
    const res = await request(app)
      .get('/api/v1/farmers/lots/d0000000-0000-0000-0000-000000000098/recommendations')
      .set('Authorization', 'Bearer farmer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.primaryAction, 'SELL_NOW');
    assert.ok(res.body.data.topMarket);
    assert.equal(res.body.data.topMarket.marketName, 'Taraori APMC Mandi');
    assert.ok(res.body.data.topMarket.estimatedNetRealization > 0);
  });
});
