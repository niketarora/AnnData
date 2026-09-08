import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../src/app.js';

describe('5. Inspection, Weighment, Offer, Transaction & Payment Flow', () => {
  const bookingId = 'e0000000-0000-0000-0000-000000000142';
  const lotId = 'd0000000-0000-0000-0000-000000000098';
  let createdOfferId: string;
  let createdTransactionId: string;

  it('buyer records physical inspection at Bay 3', async () => {
    const res = await request(app)
      .post('/api/v1/inspections')
      .set('Authorization', 'Bearer buyer-demo-token')
      .send({
        booking_id: bookingId,
        lot_id: lotId,
        physical_grade: 'Grade A',
        quality_score: 89,
        moisture: 11.8,
        defects: 1.2,
        foreign_matter: 0.5,
        notes: 'Verified high luster, uniform grain size. Premium wheat quality.',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.physical_grade, 'Grade A');
    assert.equal(res.body.data.ai_grade, 'Grade A'); // Preserves AI grade
  });

  it('buyer records weighbridge gross and tare scale reading', async () => {
    const res = await request(app)
      .post('/api/v1/weighments')
      .set('Authorization', 'Bearer buyer-demo-token')
      .send({
        booking_id: bookingId,
        lot_id: lotId,
        expected_quantity: 20.0,
        gross_weight: 5420,
        tare_weight: 3450,
        actual_quantity: 19.7, // 1,970 kg = 19.70 Quintals
        unit: 'Quintal',
        notes: 'Scale calibrated. Vehicle tare verified.',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.actual_quantity, 19.7);
    assert.equal(res.body.data.difference, -0.3);
  });

  it('buyer creates binding purchase offer with transparent mandi deductions', async () => {
    // 19.70 QTL @ ₹2,520 = ₹49,644 gross
    // Deductions: freight ₹720, mandi cess ₹744.66, unloading ₹300 = ₹1,764.66
    // Net: ₹47,879.34
    const res = await request(app)
      .post('/api/v1/offers')
      .set('Authorization', 'Bearer buyer-demo-token')
      .send({
        booking_id: bookingId,
        lot_id: lotId,
        price_per_unit: 2520,
        quantity: 19.7,
        freight_cost: 720,
        mandi_cess: 744.66,
        unloading_charges: 300,
        notes: 'Binding APMC mandi procurement offer.',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.price_per_unit, 2520);
    assert.equal(res.body.data.status, 'OFFERED');
    assert.ok(res.body.data.net_amount > 0);
    createdOfferId = res.body.data.id;
  });

  it('farmer accepts offer -> atomically creates transaction in PAYMENT_PENDING', async () => {
    const res = await request(app)
      .post(`/api/v1/offers/${createdOfferId}/accept`)
      .set('Authorization', 'Bearer farmer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.offer.status, 'ACCEPTED');
    assert.ok(res.body.data.transaction);
    assert.equal(res.body.data.transaction.payment_status, 'PAYMENT_PENDING');
    assert.ok(res.body.data.transaction.receipt_number);
    createdTransactionId = res.body.data.transaction.id;
  });

  it('buyer releases payment via DBT escrow -> transaction becomes PAID', async () => {
    const res = await request(app)
      .post(`/api/v1/payments/release/${createdTransactionId}`)
      .set('Authorization', 'Bearer buyer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.payment_status, 'PAID');
    assert.ok(res.body.data.payment_reference);
  });

  it('generates authoritative digital receipt with J-Form and financial audit trail', async () => {
    const res = await request(app)
      .get(`/api/v1/transactions/${createdTransactionId}/receipt`)
      .set('Authorization', 'Bearer farmer-demo-token');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.receiptNumber);
    assert.equal(res.body.data.commodity.cropName, 'Wheat');
    assert.equal(res.body.data.financials.paymentStatus, 'PAID');
    assert.ok(res.body.data.financials.netPayout > 0);
  });
});
