import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('6. Notifications and Grievance Dispute Management', () => {
  let createdGrievanceId: string;

  it('fetches farmer notifications and marks single notification as read', async () => {
    const listRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', 'Bearer farmer-demo-token');

    assert.equal(listRes.status, 200);
    assert.equal(listRes.body.success, true);
    assert.ok(Array.isArray(listRes.body.data));

    if (listRes.body.data.length > 0) {
      const notifId = listRes.body.data[0].id;
      const readRes = await request(app)
        .patch(`/api/v1/notifications/${notifId}/read`)
        .set('Authorization', 'Bearer farmer-demo-token');

      assert.equal(readRes.status, 200);
      assert.equal(readRes.body.success, true);
    }
  });

  it('farmer files a grievance against a weighment or transaction', async () => {
    const res = await request(app)
      .post('/api/v1/grievances')
      .set('Authorization', 'Bearer farmer-demo-token')
      .send({
        booking_id: 'e0000000-0000-0000-0000-000000000142',
        type: 'WEIGHMENT',
        description: 'Tractor tare weight difference noted on electronic scale ticket. Requesting verification.',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.type, 'WEIGHMENT');
    assert.equal(res.body.data.status, 'OPEN');
    createdGrievanceId = res.body.data.id;
  });

  it('retrieves grievance list for authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/grievances')
      .set('Authorization', 'Bearer farmer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });
});
