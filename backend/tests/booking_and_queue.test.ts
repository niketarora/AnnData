import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('4. Booking Lifecycle & Live Queue Dynamic Engine', () => {
  let createdBookingId: string;

  it('farmer requests a booking slot for an active crop lot', async () => {
    const res = await request(app)
      .post('/api/v1/farmers/bookings')
      .set('Authorization', 'Bearer farmer-demo-token')
      .send({
        lot_id: 'd0000000-0000-0000-0000-000000000098',
        buyer_id: 'b0000000-0000-0000-0000-000000000001',
        market_id: '33333333-3333-3333-3333-333333333301',
        scheduled_date: '2026-09-10',
        slot_start: '4:00 PM',
        slot_end: '4:30 PM',
        driver_name: 'Rajesh Kumar',
        vehicle_number: 'HR-05-AB-4812',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'REQUESTED');
    createdBookingId = res.body.data.id;
  });

  it('buyer accepts booking, assigns slot, and generates unique queue token', async () => {
    const res = await request(app)
      .post(`/api/v1/buyers/bookings/${createdBookingId}/assign-slot`)
      .set('Authorization', 'Bearer buyer-demo-token')
      .send({
        slot_start: '4:00 PM',
        slot_end: '4:30 PM',
        market_code: 'MKT-B',
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'SLOT_ASSIGNED');
    assert.ok(res.body.data.token);
    assert.ok(res.body.data.token.startsWith('MKT-B-'));
  });

  it('retrieves live queue status and calculations for booking', async () => {
    const res = await request(app)
      .get(`/api/v1/queue/${createdBookingId}`)
      .set('Authorization', 'Bearer farmer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.tokenNumber);
    assert.ok(Array.isArray(res.body.data.journeySteps));
    assert.equal(res.body.data.activeCounters, 4);
  });

  it('buyer adds +20 min gate delay -> queue updates to WAIT with gate notice', async () => {
    const res = await request(app)
      .post(`/api/v1/queue/${createdBookingId}/delay`)
      .set('Authorization', 'Bearer buyer-demo-token')
      .send({ minutes: 20 });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.delayMinutes, 20);
    assert.equal(res.body.data.departureState, 'WAIT');
    assert.ok(res.body.data.gateNotice.message.includes('+20 min'));
  });

  it('buyer clears queue delay -> departure recommendation switches to LEAVE_NOW', async () => {
    const res = await request(app)
      .post(`/api/v1/queue/${createdBookingId}/clear-delay`)
      .set('Authorization', 'Bearer buyer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.delayMinutes, 0);
    assert.equal(res.body.data.departureState, 'LEAVE_NOW');
    assert.ok(res.body.data.gateNotice.message.includes('Gate cleared'));
  });

  it('farmer checks in at Mandi gate -> booking and queue state update to ARRIVED', async () => {
    const res = await request(app)
      .post(`/api/v1/queue/${createdBookingId}/check-in`)
      .set('Authorization', 'Bearer farmer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.departureState, 'ARRIVED');
    assert.equal(res.body.data.lotsAhead, 0);
  });
});
