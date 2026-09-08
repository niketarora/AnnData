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
