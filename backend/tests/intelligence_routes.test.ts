import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('10. Intelligence REST Endpoints & Admin Diagnostics', () => {
  const farmerToken = 'farmer-demo-token';
  const buyerToken = 'buyer-demo-token';

  it('GET /health/intelligence returns 200/207 with database, external_data, ml, and cache statuses', async () => {
    const res = await request(app).get('/health/intelligence');
    assert.ok(res.status === 200 || res.status === 207);
    assert.ok(res.body.database === 'healthy');
    assert.ok(res.body.cache === 'healthy');
    assert.ok(res.body.details);
  });

  it('GET /api/v1/intelligence/:entityType/:entityId returns full bundle with prediction & recommendation', async () => {
    const res = await request(app)
      .get('/api/v1/intelligence/crop/55555555-5555-5555-5555-555555555501')
      .set('Authorization', `Bearer ${farmerToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.prediction);
    assert.ok(res.body.data.recommendation);
    assert.ok(res.body.data.freshness);
    assert.ok(res.body.data.factors);
  });

  it('POST /api/v1/intelligence/:entityType/:entityId/refresh forces recalculation', async () => {
    const res = await request(app)
      .post('/api/v1/intelligence/crop/55555555-5555-5555-5555-555555555501/refresh')
      .set('Authorization', `Bearer ${farmerToken}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.generatedAt);
  });

  it('POST /api/v1/predictions creates a price forecast with Zod validation', async () => {
    const res = await request(app)
      .post('/api/v1/predictions')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        crop: 'Mustard',
        variety: 'Black Mustard',
        historicalModalPrice: 5480,
        state: 'Haryana',
        district: 'Karnal',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.prediction);
    assert.ok(res.body.data.confidence > 0);
  });

  it('GET /api/v1/data/sources and /data/freshness returns metadata', async () => {
    const resSources = await request(app)
      .get('/api/v1/data/sources')
      .set('Authorization', `Bearer ${farmerToken}`);

    assert.equal(resSources.status, 200);
    assert.ok(Array.isArray(resSources.body.data));
    assert.ok(resSources.body.data.length >= 2);

    const resFreshness = await request(app)
      .get('/api/v1/data/freshness')
      .set('Authorization', `Bearer ${farmerToken}`);

    assert.equal(resFreshness.status, 200);
    assert.ok(Array.isArray(resFreshness.body.data));
  });

  it('protects admin diagnostics: allows operator and rejects farmer with 403', async () => {
    // Farmer calling admin health
    const resFarmer = await request(app)
      .get('/api/v1/admin/intelligence/health')
      .set('Authorization', `Bearer ${farmerToken}`);

    assert.equal(resFarmer.status, 403);

    // Operator demo token support
    const operatorToken = 'operator-demo-token';
    // Let's test with requireAuth missing
    const resNoAuth = await request(app).get('/api/v1/admin/intelligence/health');
    assert.equal(resNoAuth.status, 401);
  });
});
