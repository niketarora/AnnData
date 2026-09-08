# Phase 3 Engineering Notes: Market Intelligence, Risk Scoring & Decision Automation

> **AgriFintech Operating System (KrishiNetra 2.0)**  
> Lead Architect & Intelligence Engineering Report  
> Date: September 2026

---

## 1. Executive Summary & Goals Accomplished

Phase 3 transforms KrishiNetra from a connected transactional app into an **intelligence-driven fintech operating system**, integrating external APMC market data feeds, OASSM-10 price prediction models, CatBoost selling recommendation engines, deterministic business rules, and explainable decision APIs.

### Core Deliverables Completed:
1. **Machine Learning Contracts & Schemas (`/ml`)**:
   - Formally specified JSON Schemas for price prediction inputs, forecast outputs, selling recommendations, and vision quality assessments (`ml/contracts/`).
   - Production ML client (`MLClient`) with request validation, timeouts, auth headers, latency tracking, and error normalization.
2. **Database & Row Level Security Layer (`/supabase`)**:
   - Migration `20260908000004_intelligence_engine.sql` adding 11 relational intelligence tables:
     `data_sources`, `data_ingestion_runs`, `external_data_records`, `data_freshness`, `model_registry`, `prediction_runs`, `prediction_input_snapshots`, `predictions`, `recommendations`, `recommendation_factors`, and `decision_events`.
   - Complete indexes, foreign keys, and RLS policies isolating user-specific intelligence while permitting authenticated access to reference data.
   - Mirrored in `MemoryDbStore` for 100% offline, zero-dependency local testing.
3. **Provider Adapter Architecture (`/backend/src/integrations`)**:
   - `MarketDataProvider` interface with `MockMarketDataProvider` (rich Haryana mandi simulations) and `ExternalMarketDataProvider` (Agmarknet API integration).
   - `PredictionProvider` interface with `MockPredictionProvider` (deterministic OASSM-10 & CatBoost simulations) and `RealPredictionProvider` (remote FastAPI adapter).
   - Environment-based provider switching via `APP_DATA_MODE=mock | production`.
4. **Data Ingestion & Freshness Lifecycle (`/backend/src/services/data`)**:
   - Complete pipeline: fetch → validate → normalize → persist → update freshness → emit realtime event.
   - Dynamic freshness state: `LIVE` (< 15 min), `RECENT` (15–60 min), `STALE` (> 60 min), `UNAVAILABLE`.
   - Non-negotiable failure behavior: retains last valid data, marks as stale, never fabricates replacement numbers.
5. **Deterministic Rules & Precedence Hierarchy (`/backend/src/rules`)**:
   - Strict precedence: Security → Eligibility → Hard Constraints (Government MSP floor protection) → Data Validity → ML Prediction → Multi-Factor Scoring → Action Recommendation.
   - ML models cannot override eligibility or MSP price floors.
6. **Multi-Factor Scoring & Decision Engine (`/backend/src/services/intelligence`)**:
   - True Net Realization calculation factoring distance, freight rate (₹4.2/QTL/km), APMC cess (1.5%), and unloading charges.
   - Recommendation formulation answering all 6 mandatory explainability questions with factor weights and impact directions.
   - In-memory TTL caching with request hash idempotency and input snapshots.
7. **Background Jobs & Scheduler (`/backend/src/jobs`)**:
   - In-process background coordinator executing `marketSync`, `freshness`, `predictionRefresh`, `recommendationRefresh`, and `providerHealth`.
8. **REST APIs & Diagnostics (`/api/v1`)**:
   - `/api/v1/intelligence/:entityType/:entityId`
   - `/api/v1/predictions`
   - `/api/v1/recommendations`
   - `/api/v1/data`
   - Protected admin diagnostics: `/api/v1/admin/intelligence/health`, `/providers`, `/models`, `/ingestion-runs`.
   - Subsystem diagnostic endpoint: `/health/intelligence`.
9. **Frontend Intelligence Layer (`/frontend/src/features/intelligence`)**:
   - Hooks: `useIntelligence`, `usePrediction`, `useRecommendation`.
   - Components: `FreshnessBadge`, `ConfidenceIndicator` (with zero fabricated confidence), `PredictionCard`, `ExplainabilityDrawer`, `StaleDataBanner`.
   - Connected `MarketIntelligenceScreen` and `BestPlacesToSellScreen` to live backend endpoints.

---

## 2. API Endpoints Table

| Method | Path | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health/intelligence` | Public | Intelligence subsystem health (database, external data, ML, cache). |
| `GET` | `/api/v1/intelligence/:entityType/:entityId` | Authenticated | Fetches aggregated intelligence bundle with freshness. |
| `POST` | `/api/v1/intelligence/:entityType/:entityId/refresh` | Authenticated | Forces re-evaluation and cache bypass for entity. |
| `POST` | `/api/v1/predictions` | Authenticated | Generates a price prediction with input validation. |
| `GET` | `/api/v1/predictions/:id` | Authenticated | Fetches single prediction by UUID. |
| `GET` | `/api/v1/predictions/entity/:entityType/:entityId` | Authenticated | Fetches active prediction for an entity. |
| `GET` | `/api/v1/recommendations/entity/:entityType/:entityId` | Authenticated | Fetches active recommendation with explainability factors. |
| `POST` | `/api/v1/recommendations/entity/:entityType/:entityId/refresh` | Authenticated | Recalculates recommendation for entity. |
| `GET` | `/api/v1/data/sources` | Authenticated | Lists registered external data providers. |
| `GET` | `/api/v1/data/freshness` | Authenticated | Returns system-wide data freshness matrix. |
| `POST` | `/api/v1/data/refresh` | Authenticated | Manually triggers provider data synchronization. |
| `GET` | `/api/v1/admin/intelligence/health` | Operator | Provider and model health metrics with secrets isolated. |
| `GET` | `/api/v1/admin/intelligence/providers` | Operator | Active provider registry and status. |
| `GET` | `/api/v1/admin/intelligence/models` | Operator | Model registry status (`ACTIVE`, `DISABLED`). |
| `GET` | `/api/v1/admin/intelligence/ingestion-runs` | Operator | Ingestion audit run history. |
