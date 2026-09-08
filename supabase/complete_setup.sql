-- ============================================================
-- KrishiNetra 2.0 Complete Consolidated Database Setup
-- Run this in the Supabase Dashboard SQL Editor
-- Total: 33 Relational Tables, RLS Policies, Functions, & Seed Data
-- ============================================================



-- ============================================================
-- SECTION: migrations/20260908000001_initial_schema.sql
-- ============================================================

-- ============================================================
-- Migration 001: Initial Core Schema
-- AgriFintech Operating System (KrishiNetra 2.0 Architecture)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum Types
CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'operator');

CREATE TYPE crop_lot_status AS ENUM (
  'DRAFT',
  'READY',
  'BOOKING_REQUESTED',
  'BOOKED',
  'GATE_CHECKED_IN',
  'PHYSICALLY_INSPECTED',
  'WEIGHED',
  'OFFER_RECEIVED',
  'OFFER_ACCEPTED',
  'PAID',
  'SOLD',
  'CANCELLED',
  'REJECTED'
);

CREATE TYPE demand_status AS ENUM (
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'FULFILLED',
  'EXPIRED'
);

CREATE TYPE booking_status AS ENUM (
  'REQUESTED',
  'ACCEPTED',
  'REJECTED',
  'SLOT_ASSIGNED',
  'CHECKED_IN',
  'PROCESSING',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED'
);

CREATE TYPE queue_status AS ENUM (
  'WAITING',
  'CALLED',
  'CHECKED_IN',
  'PROCESSING',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED',
  'DELAYED'
);

CREATE TYPE departure_state AS ENUM (
  'WAIT',
  'GET_READY',
  'LEAVE_NOW',
  'DELAYED',
  'EARLY',
  'ARRIVED'
);

CREATE TYPE offer_status AS ENUM (
  'OFFERED',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
  'COUNTERED'
);

CREATE TYPE payment_status AS ENUM (
  'PAYMENT_PENDING',
  'PROCESSING',
  'PAID',
  'FAILED',
  'REFUNDED'
);

CREATE TYPE grievance_status AS ENUM (
  'OPEN',
  'UNDER_REVIEW',
  'RESOLVED',
  'REJECTED'
);

-- 1. Profiles (Linked to Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  role user_role NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  language TEXT DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Farmers Table
CREATE TABLE farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  farm_location TEXT,
  farm_size_acres NUMERIC(6,2),
  preferred_radius_km NUMERIC(5,1) DEFAULT 50.0,
  vehicle_type TEXT DEFAULT 'Tractor Trolley',
  vehicle_plate TEXT,
  bank_account JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Buyers Table
CREATE TABLE buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  market_name TEXT,
  mandi_gate TEXT,
  counter_id TEXT,
  license_number TEXT,
  payment_reliability_score NUMERIC(5,2) DEFAULT 95.0,
  daily_capacity_quintals NUMERIC(10,2) DEFAULT 1000.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Markets Table
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  address TEXT,
  district TEXT,
  state TEXT,
  operating_hours JSONB DEFAULT '{"open": "06:00", "close": "18:00"}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Crops Catalogue
CREATE TABLE crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  variety TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'Quintal',
  season TEXT,
  msp NUMERIC(10,2),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_crop_variety UNIQUE (name, variety)
);

-- 6. Crop Lots
CREATE TABLE crop_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id),
  variety TEXT,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'Quintal',
  expected_harvest_date DATE,
  quality_score NUMERIC(5,2),
  preliminary_grade TEXT,
  farm_location TEXT,
  status crop_lot_status NOT NULL DEFAULT 'READY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Lot Images
CREATE TABLE lot_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES crop_lots(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  capture_type TEXT DEFAULT 'STANDARD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Buyer Demands
CREATE TABLE buyer_demands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES buyers(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id),
  variety TEXT,
  minimum_grade TEXT DEFAULT 'Grade B',
  quality_requirements JSONB DEFAULT '{}',
  quantity_required NUMERIC(10,2) NOT NULL,
  quantity_fulfilled NUMERIC(10,2) NOT NULL DEFAULT 0,
  indicative_price_min NUMERIC(10,2) NOT NULL,
  indicative_price_max NUMERIC(10,2) NOT NULL,
  buying_date DATE NOT NULL,
  daily_capacity NUMERIC(10,2),
  slot_duration_minutes INT NOT NULL DEFAULT 30,
  processing_counters INT NOT NULL DEFAULT 4,
  payment_terms TEXT DEFAULT 'DBT within 24h',
  location TEXT,
  special_requirements TEXT,
  status demand_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES crop_lots(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  market_id UUID NOT NULL REFERENCES markets(id),
  scheduled_date DATE NOT NULL,
  slot_start TEXT NOT NULL,
  slot_end TEXT NOT NULL,
  token TEXT,
  revised_processing_time TEXT,
  recommended_departure_time TEXT,
  departure_state departure_state NOT NULL DEFAULT 'WAIT',
  travel_eta_minutes INT NOT NULL DEFAULT 20,
  delay_minutes INT NOT NULL DEFAULT 0,
  driver_name TEXT,
  vehicle_number TEXT,
  status booking_status NOT NULL DEFAULT 'REQUESTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Queue Tokens
CREATE TABLE queue_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id),
  token TEXT NOT NULL,
  scheduled_start TEXT,
  scheduled_end TEXT,
  sequence_number INT,
  status queue_status NOT NULL DEFAULT 'WAITING',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Queue Events
CREATE TABLE queue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT,
  delay_minutes INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Inspections
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES crop_lots(id),
  ai_grade TEXT,
  physical_grade TEXT NOT NULL,
  quality_score NUMERIC(5,2) NOT NULL,
  moisture NUMERIC(5,2),
  defects NUMERIC(5,2),
  foreign_matter NUMERIC(5,2),
  notes TEXT,
  verified_by UUID REFERENCES buyers(id),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Weighments
CREATE TABLE weighments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  lot_id UUID NOT NULL REFERENCES crop_lots(id),
  expected_quantity NUMERIC(10,2) NOT NULL,
  gross_weight NUMERIC(10,2),
  tare_weight NUMERIC(10,2),
  actual_quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'Quintal',
  difference NUMERIC(10,2) NOT NULL DEFAULT 0,
  verified_by UUID REFERENCES buyers(id),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Offers
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  farmer_id UUID NOT NULL REFERENCES farmers(id),
  lot_id UUID NOT NULL REFERENCES crop_lots(id),
  price_per_unit NUMERIC(10,2) NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  gross_amount NUMERIC(12,2) NOT NULL,
  freight_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  mandi_cess NUMERIC(10,2) NOT NULL DEFAULT 0,
  unloading_charges NUMERIC(10,2) NOT NULL DEFAULT 0,
  other_deductions NUMERIC(10,2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12,2) NOT NULL,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  status offer_status NOT NULL DEFAULT 'OFFERED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Offer Events
CREATE TABLE offer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  offer_id UUID NOT NULL UNIQUE REFERENCES offers(id),
  farmer_id UUID NOT NULL REFERENCES farmers(id),
  buyer_id UUID NOT NULL REFERENCES buyers(id),
  lot_id UUID NOT NULL REFERENCES crop_lots(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_status payment_status NOT NULL DEFAULT 'PAYMENT_PENDING',
  payment_reference TEXT,
  receipt_number TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  provider TEXT NOT NULL DEFAULT 'MOCK_DBT_ESCROW',
  provider_reference TEXT,
  status payment_status NOT NULL DEFAULT 'PAYMENT_PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 18. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'SYSTEM',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_route TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Grievances
CREATE TABLE grievances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  transaction_id UUID REFERENCES transactions(id),
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  status grievance_status NOT NULL DEFAULT 'OPEN',
  created_by UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 20. Market Prices (External Reference)
CREATE TABLE market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES crops(id),
  min_price NUMERIC(10,2) NOT NULL,
  max_price NUMERIC(10,2) NOT NULL,
  modal_price NUMERIC(10,2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. Weather (External Reference)
CREATE TABLE weather (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  temperature NUMERIC(4,1),
  rainfall NUMERIC(5,1),
  humidity NUMERIC(4,1),
  forecast TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 22. Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for frequent queries
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_farmers_profile_id ON farmers(profile_id);
CREATE INDEX idx_buyers_profile_id ON buyers(profile_id);
CREATE INDEX idx_crop_lots_farmer ON crop_lots(farmer_id);
CREATE INDEX idx_crop_lots_status ON crop_lots(status);
CREATE INDEX idx_buyer_demands_buyer ON buyer_demands(buyer_id);
CREATE INDEX idx_buyer_demands_status ON buyer_demands(status);
CREATE INDEX idx_bookings_lot ON bookings(lot_id);
CREATE INDEX idx_bookings_buyer ON bookings(buyer_id);
CREATE INDEX idx_bookings_market ON bookings(market_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_queue_tokens_token ON queue_tokens(token);
CREATE INDEX idx_offers_booking ON offers(booking_id);
CREATE INDEX idx_offers_farmer ON offers(farmer_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_transactions_booking ON transactions(booking_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);



-- ============================================================
-- SECTION: migrations/20260908000002_rls_policies.sql
-- ============================================================

-- ============================================================
-- Migration 002: Row Level Security (RLS) Policies
-- AgriFintech Operating System (KrishiNetra 2.0 Architecture)
-- ============================================================

-- Enable RLS on all user-owned and transactional tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE lot_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_demands ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE weighments ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions to get current user's profile and roles
CREATE OR REPLACE FUNCTION current_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_farmer_id()
RETURNS UUID AS $$
  SELECT f.id FROM farmers f
  JOIN profiles p ON f.profile_id = p.id
  WHERE p.user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_buyer_id()
RETURNS UUID AS $$
  SELECT b.id FROM buyers b
  JOIN profiles p ON b.profile_id = p.id
  WHERE p.user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid() OR current_user_role() = 'operator');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow profile creation on signup"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.role() = 'service_role');

-- 2. Farmers Policies
CREATE POLICY "Farmers can view own farmer profile"
  ON farmers FOR SELECT
  USING (profile_id = current_profile_id() OR current_user_role() IN ('buyer', 'operator'));

CREATE POLICY "Farmers can update own farmer profile"
  ON farmers FOR UPDATE
  USING (profile_id = current_profile_id())
  WITH CHECK (profile_id = current_profile_id());

CREATE POLICY "Farmers can insert own farmer profile"
  ON farmers FOR INSERT
  WITH CHECK (profile_id = current_profile_id());

-- 3. Buyers Policies
CREATE POLICY "Buyers can view buyer profiles"
  ON buyers FOR SELECT
  USING (true); -- Publicly viewable by participants for market trust

CREATE POLICY "Buyers can update own buyer profile"
  ON buyers FOR UPDATE
  USING (profile_id = current_profile_id())
  WITH CHECK (profile_id = current_profile_id());

CREATE POLICY "Buyers can insert own buyer profile"
  ON buyers FOR INSERT
  WITH CHECK (profile_id = current_profile_id());

-- 4. Markets Policies (Read-only for users, managed by operators/service role)
CREATE POLICY "Markets are viewable by all authenticated users"
  ON markets FOR SELECT
  USING (true);

CREATE POLICY "Only operators can manage markets"
  ON markets FOR ALL
  USING (current_user_role() = 'operator' OR auth.role() = 'service_role');

-- 5. Crops Policies (Catalogue viewable by all authenticated users)
CREATE POLICY "Crops are viewable by all authenticated users"
  ON crops FOR SELECT
  USING (true);

CREATE POLICY "Only operators can modify crops catalogue"
  ON crops FOR ALL
  USING (current_user_role() = 'operator' OR auth.role() = 'service_role');

-- 6. Crop Lots Policies
CREATE POLICY "Farmers can view their own crop lots"
  ON crop_lots FOR SELECT
  USING (
    farmer_id = current_farmer_id()
    OR current_user_role() IN ('buyer', 'operator')
  );

CREATE POLICY "Farmers can create their own crop lots"
  ON crop_lots FOR INSERT
  WITH CHECK (farmer_id = current_farmer_id());

CREATE POLICY "Farmers can update their own crop lots"
  ON crop_lots FOR UPDATE
  USING (farmer_id = current_farmer_id() OR current_user_role() IN ('buyer', 'operator'))
  WITH CHECK (farmer_id = current_farmer_id() OR current_user_role() IN ('buyer', 'operator'));

CREATE POLICY "Farmers can delete their own draft lots"
  ON crop_lots FOR DELETE
  USING (farmer_id = current_farmer_id() AND status = 'DRAFT');

-- 7. Lot Images Policies
CREATE POLICY "Lot images viewable if lot is viewable"
  ON lot_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crop_lots
      WHERE crop_lots.id = lot_images.lot_id
        AND (crop_lots.farmer_id = current_farmer_id() OR current_user_role() IN ('buyer', 'operator'))
    )
  );

CREATE POLICY "Farmers can insert lot images"
  ON lot_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM crop_lots
      WHERE crop_lots.id = lot_images.lot_id
        AND crop_lots.farmer_id = current_farmer_id()
    )
  );

-- 8. Buyer Demands Policies
CREATE POLICY "Demands viewable by all participants"
  ON buyer_demands FOR SELECT
  USING (true);

CREATE POLICY "Buyers can manage their own demands"
  ON buyer_demands FOR ALL
  USING (buyer_id = current_buyer_id() OR current_user_role() = 'operator')
  WITH CHECK (buyer_id = current_buyer_id() OR current_user_role() = 'operator');

-- 9. Bookings Policies
CREATE POLICY "Bookings viewable by involved farmer or buyer"
  ON bookings FOR SELECT
  USING (
    buyer_id = current_buyer_id()
    OR EXISTS (
      SELECT 1 FROM crop_lots
      WHERE crop_lots.id = bookings.lot_id AND crop_lots.farmer_id = current_farmer_id()
    )
    OR current_user_role() = 'operator'
  );

CREATE POLICY "Farmers can request bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM crop_lots
      WHERE crop_lots.id = bookings.lot_id AND crop_lots.farmer_id = current_farmer_id()
    )
  );

CREATE POLICY "Buyers and Farmers can update bookings as per workflow"
  ON bookings FOR UPDATE
  USING (
    buyer_id = current_buyer_id()
    OR EXISTS (
      SELECT 1 FROM crop_lots
      WHERE crop_lots.id = bookings.lot_id AND crop_lots.farmer_id = current_farmer_id()
    )
    OR current_user_role() = 'operator'
  );

-- 10. Queue Tokens & Events Policies
CREATE POLICY "Queue tokens viewable by authenticated users"
  ON queue_tokens FOR SELECT
  USING (true);

CREATE POLICY "Queue tokens managed by buyers and operators"
  ON queue_tokens FOR ALL
  USING (current_user_role() IN ('buyer', 'operator') OR auth.role() = 'service_role');

CREATE POLICY "Queue events viewable by involved participants"
  ON queue_events FOR SELECT
  USING (true);

CREATE POLICY "Queue events insertable by buyers or operators"
  ON queue_events FOR INSERT
  WITH CHECK (current_user_role() IN ('buyer', 'operator') OR auth.role() = 'service_role');

-- 11. Inspections Policies
CREATE POLICY "Inspections viewable by booking participants"
  ON inspections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN crop_lots cl ON b.lot_id = cl.id
      WHERE b.id = inspections.booking_id
        AND (b.buyer_id = current_buyer_id() OR cl.farmer_id = current_farmer_id() OR current_user_role() = 'operator')
    )
  );

CREATE POLICY "Only authorized buyers or operators can record inspections"
  ON inspections FOR INSERT
  WITH CHECK (current_user_role() IN ('buyer', 'operator') OR auth.role() = 'service_role');

CREATE POLICY "Only authorized buyers or operators can update inspections"
  ON inspections FOR UPDATE
  USING (current_user_role() IN ('buyer', 'operator') OR auth.role() = 'service_role');

-- 12. Weighments Policies
CREATE POLICY "Weighments viewable by booking participants"
  ON weighments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN crop_lots cl ON b.lot_id = cl.id
      WHERE b.id = weighments.booking_id
        AND (b.buyer_id = current_buyer_id() OR cl.farmer_id = current_farmer_id() OR current_user_role() = 'operator')
    )
  );

CREATE POLICY "Only authorized buyers or operators can record weighments"
  ON weighments FOR INSERT
  WITH CHECK (current_user_role() IN ('buyer', 'operator') OR auth.role() = 'service_role');

CREATE POLICY "Only authorized buyers or operators can update weighments"
  ON weighments FOR UPDATE
  USING (current_user_role() IN ('buyer', 'operator') OR auth.role() = 'service_role');

-- 13. Offers Policies
CREATE POLICY "Offers viewable by involved buyer and farmer"
  ON offers FOR SELECT
  USING (
    buyer_id = current_buyer_id()
    OR farmer_id = current_farmer_id()
    OR current_user_role() = 'operator'
  );

CREATE POLICY "Only buyers can create offers"
  ON offers FOR INSERT
  WITH CHECK (buyer_id = current_buyer_id() OR current_user_role() = 'operator');

CREATE POLICY "Buyers and Farmers can update offer status"
  ON offers FOR UPDATE
  USING (
    buyer_id = current_buyer_id()
    OR farmer_id = current_farmer_id()
    OR current_user_role() = 'operator'
  );

-- 14. Transactions & Payments Policies
CREATE POLICY "Transactions viewable by involved farmer and buyer"
  ON transactions FOR SELECT
  USING (
    farmer_id = current_farmer_id()
    OR buyer_id = current_buyer_id()
    OR current_user_role() = 'operator'
  );

CREATE POLICY "Only backend or authorized buyers can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (buyer_id = current_buyer_id() OR auth.role() = 'service_role' OR current_user_role() = 'operator');

CREATE POLICY "Transaction updates restricted"
  ON transactions FOR UPDATE
  USING (buyer_id = current_buyer_id() OR auth.role() = 'service_role' OR current_user_role() = 'operator');

CREATE POLICY "Payments viewable by involved participants"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = payments.transaction_id
        AND (t.farmer_id = current_farmer_id() OR t.buyer_id = current_buyer_id() OR current_user_role() = 'operator')
    )
  );

CREATE POLICY "Only authorized buyers or backend can update payment status"
  ON payments FOR ALL
  USING (auth.role() = 'service_role' OR current_user_role() IN ('buyer', 'operator'));

-- 15. Notifications Policies
CREATE POLICY "Users can only see their own notifications"
  ON notifications FOR SELECT
  USING (user_id = current_profile_id());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = current_profile_id())
  WITH CHECK (user_id = current_profile_id());

CREATE POLICY "Insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- 16. Grievances Policies
CREATE POLICY "Users can view their own grievances"
  ON grievances FOR SELECT
  USING (user_id = current_profile_id() OR current_user_role() = 'operator');

CREATE POLICY "Users can file grievances"
  ON grievances FOR INSERT
  WITH CHECK (user_id = current_profile_id());

CREATE POLICY "Operators can update grievances"
  ON grievances FOR UPDATE
  USING (current_user_role() = 'operator' OR user_id = current_profile_id());

-- 17. Market Prices & Weather Policies (Publicly viewable)
CREATE POLICY "Market prices publicly viewable"
  ON market_prices FOR SELECT
  USING (true);

CREATE POLICY "Weather publicly viewable"
  ON weather FOR SELECT
  USING (true);

-- 18. Audit Logs Policies (Viewable by operators and service role only)
CREATE POLICY "Audit logs viewable by operators"
  ON audit_logs FOR SELECT
  USING (current_user_role() = 'operator' OR auth.role() = 'service_role');

CREATE POLICY "Audit logs insertable by all service actions"
  ON audit_logs FOR INSERT
  WITH CHECK (true);



-- ============================================================
-- SECTION: migrations/20260908000003_functions_and_triggers.sql
-- ============================================================

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



-- ============================================================
-- SECTION: migrations/20260908000004_intelligence_engine.sql
-- ============================================================

-- ============================================================
-- Migration 004: Market Intelligence, Risk Scoring & Decision Engine
-- AgriFintech Operating System (KrishiNetra 2.0 Architecture)
-- Phase 3 Intelligence Tables & RLS Policies
-- ============================================================

-- Create Enums for Phase 3
CREATE TYPE ingestion_run_status AS ENUM ('RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');
CREATE TYPE data_freshness_status AS ENUM ('LIVE', 'RECENT', 'STALE', 'UNAVAILABLE');
CREATE TYPE model_registry_status AS ENUM ('ACTIVE', 'DISABLED', 'RETIRED');
CREATE TYPE factor_impact AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE intelligence_action AS ENUM ('SELL_NOW', 'WAIT', 'PARTIAL_SELL');

-- 1. Data Sources Table (APMC, Weather, Commodity indices)
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL, -- 'mandi_prices', 'weather', 'logistics', 'msp'
    base_url VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    refresh_interval_seconds INTEGER NOT NULL DEFAULT 900, -- 15 mins default
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Data Ingestion Runs
CREATE TABLE IF NOT EXISTS data_ingestion_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status ingestion_run_status NOT NULL DEFAULT 'RUNNING',
    records_received INTEGER NOT NULL DEFAULT 0,
    records_inserted INTEGER NOT NULL DEFAULT 0,
    records_updated INTEGER NOT NULL DEFAULT 0,
    records_rejected INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. External Data Records (Normalized history)
CREATE TABLE IF NOT EXISTS external_data_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'market', 'crop', 'weather'
    entity_id VARCHAR(100) NOT NULL,
    source_record_id VARCHAR(100),
    observed_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    provider_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    ingestion_status data_freshness_status NOT NULL DEFAULT 'LIVE',
    raw_payload JSONB,
    normalized_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Data Freshness Tracking
CREATE TABLE IF NOT EXISTS data_freshness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    status data_freshness_status NOT NULL DEFAULT 'LIVE',
    last_observed_at TIMESTAMPTZ NOT NULL,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    source_id UUID REFERENCES data_sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_entity_freshness UNIQUE (entity_type, entity_id)
);

-- 5. Model Registry
CREATE TABLE IF NOT EXISTS model_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    provider VARCHAR(100) NOT NULL, -- 'OASSM-10', 'CatBoost', 'VisionClassifier', 'DeterministicRules'
    input_schema_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    output_schema_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    status model_registry_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    retired_at TIMESTAMPTZ,
    CONSTRAINT uq_model_version UNIQUE (model_name, version)
);

-- 6. Prediction Runs (Audit & Idempotency)
CREATE TABLE IF NOT EXISTS prediction_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES model_registry(id) ON DELETE RESTRICT,
    entity_type VARCHAR(50) NOT NULL, -- 'crop_lot', 'market'
    entity_id VARCHAR(100) NOT NULL,
    request_hash VARCHAR(64) NOT NULL, -- SHA-256 / MD5 of input features
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'FALLBACK'
    latency_ms INTEGER NOT NULL DEFAULT 0,
    error_code VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Prediction Input Snapshots (Reproducibility)
CREATE TABLE IF NOT EXISTS prediction_input_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_run_id UUID NOT NULL REFERENCES prediction_runs(id) ON DELETE CASCADE,
    schema_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    input_hash VARCHAR(64) NOT NULL,
    input_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Predictions
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_run_id UUID NOT NULL REFERENCES prediction_runs(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL, -- 'price_forecast', 'quality_assessment'
    value_json JSONB NOT NULL,
    confidence NUMERIC(5, 4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
    model_version VARCHAR(50) NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' -- 'ACTIVE', 'EXPIRED', 'SUPERSEDED'
);

-- 9. Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL, -- 'crop_lot', 'market'
    entity_id VARCHAR(100) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL DEFAULT 'selling_decision',
    decision intelligence_action NOT NULL,
    score NUMERIC(5, 4) NOT NULL CHECK (score >= 0 AND score <= 1),
    confidence NUMERIC(5, 4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
    reason TEXT NOT NULL,
    ranked_markets JSONB,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
);

-- 10. Recommendation Factors (Explainability)
CREATE TABLE IF NOT EXISTS recommendation_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    factor VARCHAR(100) NOT NULL,
    value VARCHAR(255) NOT NULL,
    weight NUMERIC(5, 4) NOT NULL CHECK (weight >= 0 AND weight <= 1),
    impact factor_impact NOT NULL DEFAULT 'positive',
    direction VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Decision Events (Material decision audit log)
CREATE TABLE IF NOT EXISTS decision_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    recommendation_id UUID REFERENCES recommendations(id) ON DELETE SET NULL,
    model_version VARCHAR(50) NOT NULL,
    input_snapshot_reference UUID REFERENCES prediction_input_snapshots(id) ON DELETE SET NULL,
    decision intelligence_action NOT NULL,
    score NUMERIC(5, 4) NOT NULL,
    confidence NUMERIC(5, 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-velocity queries
CREATE INDEX IF NOT EXISTS idx_external_data_entity ON external_data_records(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_external_data_observed ON external_data_records(observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_freshness_status ON data_freshness(status);
CREATE INDEX IF NOT EXISTS idx_prediction_runs_hash ON prediction_runs(request_hash);
CREATE INDEX IF NOT EXISTS idx_predictions_entity ON predictions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_predictions_expires ON predictions(expires_at);
CREATE INDEX IF NOT EXISTS idx_recommendations_entity ON recommendations(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_expires ON recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_factors_recommendation ON recommendation_factors(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_decision_events_user ON decision_events(user_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_data_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_freshness ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_input_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_events ENABLE ROW LEVEL SECURITY;

-- Reference and market data: Readable by all authenticated users
CREATE POLICY "Authenticated users can read data sources"
    ON data_sources FOR SELECT
    TO authenticated
    USING (active = TRUE);

CREATE POLICY "Authenticated users can read external data records"
    ON external_data_records FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated users can read data freshness"
    ON data_freshness FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated users can read model registry"
    ON model_registry FOR SELECT
    TO authenticated
    USING (status = 'ACTIVE');

-- Operators/Admins have full access to ingestion and models
CREATE POLICY "Operators manage data sources"
    ON data_sources FOR ALL
    TO authenticated
    USING (current_user_role() = 'operator');

CREATE POLICY "Operators manage ingestion runs"
    ON data_ingestion_runs FOR ALL
    TO authenticated
    USING (current_user_role() = 'operator');

-- Predictions & Recommendations: Authenticated users can read valid predictions & recommendations
CREATE POLICY "Users can view predictions for entities"
    ON predictions FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Users can view recommendations for entities"
    ON recommendations FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Users can view recommendation factors"
    ON recommendation_factors FOR SELECT
    TO authenticated
    USING (TRUE);

-- Decision Events: Restricted to owning user or operator
CREATE POLICY "Users can view their own decision events"
    ON decision_events FOR SELECT
    TO authenticated
    USING (user_id = current_profile_id() OR current_user_role() = 'operator');

CREATE POLICY "Users can record their own decision events"
    ON decision_events FOR INSERT
    TO authenticated
    WITH CHECK (user_id = current_profile_id());



-- ============================================================
-- SECTION: seed.sql
-- ============================================================

-- ============================================================
-- Seed Data: Development Demo Persona & Entities
-- AgriFintech Operating System (KrishiNetra 2.0 Architecture)
-- ============================================================

-- 1. Profiles
INSERT INTO profiles (id, user_id, role, name, phone, email, language, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'farmer', 'Rajesh Kumar', '+91 98765 43210', 'rajesh.kumar@example.com', 'hi', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('00000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'buyer', 'Anil Sharma', '+91 98123 45678', 'anil.sharma@example.com', 'en', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150')
ON CONFLICT (id) DO NOTHING;

-- 2. Farmer Persona
INSERT INTO farmers (id, profile_id, farm_location, farm_size_acres, preferred_radius_km, vehicle_type, vehicle_plate, bank_account) VALUES
('f0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Karnal Farm #3, Haryana', 8.50, 45.0, 'Tractor Trolley', 'HR-05-AB-4812', '{
  "accountNumberMasked": "•••• •••• 8492",
  "bankName": "State Bank of India",
  "ifsc": "SBIN0001248",
  "upiId": "rajesh.krishi@oksbi",
  "verified": true
}')
ON CONFLICT (id) DO NOTHING;

-- 3. Buyer Persona
INSERT INTO buyers (id, profile_id, organization_name, market_name, mandi_gate, counter_id, license_number, payment_reliability_score, daily_capacity_quintals) VALUES
('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Kisan Agritech Mandi Consortium', 'Taraori APMC Mandi', 'Gate 2 Express Line', 'Counter 4', 'APMC-HAR-2024-8891', 98.00, 1000.00)
ON CONFLICT (id) DO NOTHING;

-- 4. Markets
INSERT INTO markets (id, name, code, location, latitude, longitude, address, district, state, operating_hours, active) VALUES
('33333333-3333-3333-3333-333333333301', 'Taraori APMC Mandi', 'MKT-B-TARAORI', 'Taraori, GT Road', 29.8028, 76.9297, 'National Highway 44, Taraori', 'Karnal', 'Haryana', '{"open": "06:00", "close": "18:00"}', true),
('33333333-3333-3333-3333-333333333302', 'Karnal Main APMC', 'MKT-A-KARNAL', 'Karnal City Center', 29.6857, 76.9905, 'Sector 12 New Grain Market', 'Karnal', 'Haryana', '{"open": "05:30", "close": "19:00"}', true),
('33333333-3333-3333-3333-333333333303', 'Gharaunda Sub-Yard', 'MKT-C-GHARAUNDA', 'Gharaunda Mandi Yard', 29.5412, 76.9714, 'Station Road, Gharaunda', 'Karnal', 'Haryana', '{"open": "07:00", "close": "17:00"}', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Crops Catalogue
INSERT INTO crops (id, name, variety, unit, season, msp, active) VALUES
('c0000000-0000-0000-0000-000000000001', 'Wheat', 'Sharbati', 'Quintal', 'Rabi 2026', 2275.00, true),
('c0000000-0000-0000-0000-000000000002', 'Paddy', 'Basmati 1121', 'Quintal', 'Kharif 2026', 3600.00, true),
('c0000000-0000-0000-0000-000000000003', 'Mustard', 'Pusa Bold', 'Quintal', 'Rabi 2026', 5650.00, true)
ON CONFLICT (id) DO NOTHING;

-- 6. Buyer Demand
INSERT INTO buyer_demands (id, buyer_id, crop_id, variety, minimum_grade, quality_requirements, quantity_required, quantity_fulfilled, indicative_price_min, indicative_price_max, buying_date, daily_capacity, slot_duration_minutes, processing_counters, payment_terms, location, status) VALUES
('d1111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Sharbati', 'Grade A', '{"maxMoisture": 12.0, "minLuster": 85}', 500.00, 180.00, 2480.00, 2560.00, CURRENT_DATE, 1000.00, 30, 4, 'Instant DBT via Escrow', 'Taraori Gate 2', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 7. Farmer Crop Lot (Lot #WH-098)
INSERT INTO crop_lots (id, farmer_id, crop_id, variety, quantity, unit, expected_harvest_date, quality_score, preliminary_grade, farm_location, status) VALUES
('d0000000-0000-0000-0000-000000000098', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Sharbati', 20.00, 'Quintal', CURRENT_DATE, 88.00, 'Grade A', 'Karnal Farm #3', 'BOOKED')
ON CONFLICT (id) DO NOTHING;

-- 8. Lot Images
INSERT INTO lot_images (lot_id, image_url, capture_type) VALUES
('d0000000-0000-0000-0000-000000000098', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600', 'TOP_OVERVIEW'),
('d0000000-0000-0000-0000-000000000098', 'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600', 'GRAIN_CLOSEUP'),
('d0000000-0000-0000-0000-000000000098', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600', 'HAND_SAMPLE');

-- 9. Booking (Booking #B-142)
INSERT INTO bookings (id, lot_id, buyer_id, market_id, scheduled_date, slot_start, slot_end, token, revised_processing_time, recommended_departure_time, departure_state, travel_eta_minutes, delay_minutes, driver_name, vehicle_number, status) VALUES
('e0000000-0000-0000-0000-000000000142', 'd0000000-0000-0000-0000-000000000098', 'b0000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333301', CURRENT_DATE, '3:30 PM', '4:00 PM', 'MKT-B-142', '3:30 PM', '3:15 PM', 'WAIT', 18, 0, 'Rajesh Kumar', 'HR-05-AB-4812', 'SLOT_ASSIGNED')
ON CONFLICT (id) DO NOTHING;

-- 10. Queue Token
INSERT INTO queue_tokens (booking_id, market_id, token, scheduled_start, scheduled_end, sequence_number, status) VALUES
('e0000000-0000-0000-0000-000000000142', '33333333-3333-3333-3333-333333333301', 'MKT-B-142', '3:30 PM', '4:00 PM', 142, 'WAITING')
ON CONFLICT (booking_id) DO NOTHING;

-- 11. Notifications
INSERT INTO notifications (id, user_id, role, category, title, message, action_route, read) VALUES
('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'FARMER', 'QUEUE', 'Mandi Gate Congestion Alert', 'Taraori Mandi Gate 2 queue updated. Please monitor departure status before driving.', 'LiveMandiQueue', false),
('90000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'BUYER', 'QUEUE', 'New Booking Slot Reserved', 'Rajesh Kumar booked slot 3:30–4:00 PM for 20 QTL Sharbati Wheat (Token #MKT-B-142).', 'QueueControlPanel', false)
ON CONFLICT (id) DO NOTHING;

