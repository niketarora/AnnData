import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('1. Health Check Endpoint', () => {
  it('GET /health returns 200 with API status, version, and environment', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'UP');
    assert.equal(res.body.version, '2.0.0');
    assert.ok(res.body.api.includes('AgriFintech'));
    assert.ok(res.body.timestamp);
  });
});
