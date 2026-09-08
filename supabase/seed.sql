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
