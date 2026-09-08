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
