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
