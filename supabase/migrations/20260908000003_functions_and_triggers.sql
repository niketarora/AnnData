-- ============================================================
-- Migration 003: Functions and Triggers
-- AgriFintech Operating System (KrishiNetra 2.0 Architecture)
-- ============================================================

-- 1. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_farmers_updated_at BEFORE UPDATE ON farmers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_buyers_updated_at BEFORE UPDATE ON buyers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_markets_updated_at BEFORE UPDATE ON markets
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_crops_updated_at BEFORE UPDATE ON crops
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_crop_lots_updated_at BEFORE UPDATE ON crop_lots
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_buyer_demands_updated_at BEFORE UPDATE ON buyer_demands
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_offers_updated_at BEFORE UPDATE ON offers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Atomic Booking Acceptance, Slot Assignment & Token Generation
CREATE OR REPLACE FUNCTION accept_booking_and_generate_token(
  p_booking_id UUID,
  p_slot_start TEXT,
  p_slot_end TEXT,
  p_market_code TEXT DEFAULT 'MKT-B'
)
RETURNS JSONB AS $$
DECLARE
  v_booking RECORD;
  v_token_number TEXT;
  v_seq INT;
  v_market_id UUID;
  v_farmer_profile_id UUID;
BEGIN
  -- Fetch booking
  SELECT b.*, cl.farmer_id INTO v_booking
  FROM bookings b
  JOIN crop_lots cl ON b.lot_id = cl.id
  WHERE b.id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found with ID %', p_booking_id;
  END IF;

  IF v_booking.status != 'REQUESTED' THEN
    RAISE EXCEPTION 'Booking is in status % and cannot be accepted', v_booking.status;
  END IF;

  -- Get sequence number for token
  SELECT COALESCE(MAX(sequence_number), 140) + 1 INTO v_seq
  FROM queue_tokens
  WHERE market_id = v_booking.market_id;

  v_token_number := p_market_code || '-' || v_seq;

  -- Update booking
  UPDATE bookings
  SET
    status = 'SLOT_ASSIGNED',
    slot_start = p_slot_start,
    slot_end = p_slot_end,
    token = v_token_number,
    revised_processing_time = p_slot_start,
    recommended_departure_time = '3:15 PM',
    departure_state = 'WAIT',
    updated_at = now()
  WHERE id = p_booking_id;

  -- Update lot status
  UPDATE crop_lots
  SET status = 'BOOKED', updated_at = now()
  WHERE id = v_booking.lot_id;

  -- Insert queue token
  INSERT INTO queue_tokens (
    booking_id,
    market_id,
    token,
    scheduled_start,
    scheduled_end,
    sequence_number,
    status
  ) VALUES (
    p_booking_id,
    v_booking.market_id,
    v_token_number,
    p_slot_start,
    p_slot_end,
    v_seq,
    'WAITING'
  );

  -- Log queue event
  INSERT INTO queue_events (
    booking_id,
    event_type,
    old_status,
    new_status,
    notes
  ) VALUES (
    p_booking_id,
    'SLOT_ASSIGNED',
    'REQUESTED',
    'SLOT_ASSIGNED',
    'Slot assigned ' || p_slot_start || '–' || p_slot_end || ' with token ' || v_token_number
  );

  -- Notify farmer
  SELECT f.profile_id INTO v_farmer_profile_id
  FROM farmers f
  WHERE f.id = v_booking.farmer_id;

  IF v_farmer_profile_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      role,
      category,
      title,
      message,
      action_route
    ) VALUES (
      v_farmer_profile_id,
      'FARMER',
      'BOOKING',
      'Booking Slot Assigned (' || v_token_number || ')',
      'Your slot at Taraori Mandi is confirmed for ' || p_slot_start || '–' || p_slot_end || '. Token: ' || v_token_number,
      'LiveMandiQueue'
    );
  END IF;

  RETURN jsonb_build_object(
    'booking_id', p_booking_id,
    'token', v_token_number,
    'status', 'SLOT_ASSIGNED',
    'slot_start', p_slot_start,
    'slot_end', p_slot_end
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Atomic Offer Acceptance & Transaction Creation
CREATE OR REPLACE FUNCTION accept_offer_and_create_transaction(
  p_offer_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_offer RECORD;
  v_receipt_number TEXT;
  v_transaction_id UUID;
  v_buyer_profile_id UUID;
BEGIN
  -- Fetch offer
  SELECT * INTO v_offer
  FROM offers
  WHERE id = p_offer_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Offer not found with ID %', p_offer_id;
  END IF;

  IF v_offer.status != 'OFFERED' THEN
    RAISE EXCEPTION 'Offer is in status % and cannot be accepted', v_offer.status;
  END IF;

  -- Update offer
  UPDATE offers
  SET status = 'ACCEPTED', updated_at = now()
  WHERE id = p_offer_id;

  -- Update lot status
  UPDATE crop_lots
  SET status = 'OFFER_ACCEPTED', updated_at = now()
  WHERE id = v_offer.lot_id;

  -- Generate receipt number
  v_receipt_number := 'REC-' || to_char(now(), 'YYYYMMDD') || '-' || substring(p_offer_id::text from 1 for 6);

  -- Create Transaction
  INSERT INTO transactions (
    booking_id,
    offer_id,
    farmer_id,
    buyer_id,
    lot_id,
    amount,
    currency,
    payment_status,
    receipt_number
  ) VALUES (
    v_offer.booking_id,
    p_offer_id,
    v_offer.farmer_id,
    v_offer.buyer_id,
    v_offer.lot_id,
    v_offer.net_amount,
    'INR',
    'PAYMENT_PENDING',
    v_receipt_number
  ) RETURNING id INTO v_transaction_id;

  -- Create Payment record in pending state
  INSERT INTO payments (
    transaction_id,
    amount,
    currency,
    provider,
    provider_reference,
    status
  ) VALUES (
    v_transaction_id,
    v_offer.net_amount,
    'INR',
    'MOCK_DBT_ESCROW',
    'ESCROW-' || substring(v_transaction_id::text from 1 for 8),
    'PAYMENT_PENDING'
  );

  -- Log offer event
  INSERT INTO offer_events (
    offer_id,
    action,
    actor_id,
    note
  ) VALUES (
    p_offer_id,
    'ACCEPTED',
    v_offer.farmer_id,
    'Offer of ₹' || v_offer.net_amount || ' accepted by farmer. Transaction created.'
  );

  -- Notify buyer
  SELECT b.profile_id INTO v_buyer_profile_id
  FROM buyers b
  WHERE b.id = v_offer.buyer_id;

  IF v_buyer_profile_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      role,
      category,
      title,
      message,
      action_route
    ) VALUES (
      v_buyer_profile_id,
      'BUYER',
      'OFFER',
      'Offer Accepted by Farmer',
      'Farmer accepted offer of ₹' || v_offer.net_amount || '. Please release payment.',
      'BuyerTransactions'
    );
  END IF;

  RETURN jsonb_build_object(
    'offer_id', p_offer_id,
    'transaction_id', v_transaction_id,
    'receipt_number', v_receipt_number,
    'amount', v_offer.net_amount,
    'status', 'PAYMENT_PENDING'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
