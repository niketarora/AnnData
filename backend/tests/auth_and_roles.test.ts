import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('2. Authentication and Role Authorization Middleware', () => {
  it('rejects protected endpoints without Authorization header with 401', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  it('resolves farmer profile when farmer demo token is supplied', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer farmer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.profile.role, 'farmer');
    assert.equal(res.body.data.profile.name, 'Rajesh Kumar');
    assert.ok(res.body.data.farmer);
    assert.equal(res.body.data.farmer.farm_location, 'Karnal Farm #3, Haryana');
  });

  it('resolves buyer profile when buyer demo token is supplied', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer buyer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.profile.role, 'buyer');
    assert.equal(res.body.data.profile.name, 'Anil Sharma');
    assert.ok(res.body.data.buyer);
    assert.equal(res.body.data.buyer.organization_name, 'Kisan Agritech Mandi Consortium');
  });

  it('forbids farmer from calling buyer-only endpoints with 403', async () => {
    const res = await request(app)
      .post('/api/v1/buyers/demands')
      .set('Authorization', 'Bearer farmer-demo-token')
      .send({
        crop_id: 'c0000000-0000-0000-0000-000000000001',
        variety: 'Sharbati',
        quantity_required: 100,
        indicative_price_min: 2400,
        indicative_price_max: 2500,
        buying_date: '2026-09-10',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  it('forbids buyer from calling farmer-only endpoints with 403', async () => {
    const res = await request(app)
      .post('/api/v1/farmers/lots')
      .set('Authorization', 'Bearer buyer-demo-token')
      .send({
        crop_id: 'c0000000-0000-0000-0000-000000000001',
        variety: 'Sharbati',
        quantity: 50,
        farm_location: 'Karnal',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });
});
