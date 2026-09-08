# Phase 2 Engineering Notes: Architecture, Backend Implementation, and Migrations

> **AgriFintech Operating System (KrishiNetra 2.0)**  
> Lead Architect & Backend Engineering Report  
> Date: September 2026

---

## 1. Executive Summary & Goals Accomplished

Phase 2 successfully transforms KrishiNetra from a standalone React Native prototype into an **enterprise-grade full-stack AgriFintech platform**.

### Core Deliverables Completed:
1. **Monorepo Partitioning**:
   - Clean separation into `/frontend`, `/backend`, `/supabase`, `/ml`, `/docs`, and `/scripts`.
   - Root monorepo orchestration (`package.json`) executing unified typechecks and test pipelines.
   - Mobile app (React Native 0.86, Expo SDK 57, TypeScript) fully preserved with all 31 screens intact and zero regressions.
2. **Enterprise Express 5 Backend (`/backend`)**:
   - Node.js 20+ ESM architecture with strict TypeScript compilation (`NodeNext`).
   - Zod schema validation across all request params, queries, and bodies with structured 422 error reporting.
   - Dual data layer: Supabase PostgreSQL client with Supabase Auth/RLS, coupled with an automatic in-memory deterministic fallback initialized from `seed.sql` for instant local/test execution without remote dependency bottlenecks.
   - Centralized Pino structured logger with timestamped and contextual JSON logs.
   - Unified domain error handler with standardized HTTP status codes and operational error codes.
3. **Database & RLS Layer (`/supabase`)**:
   - 22 PostgreSQL tables covering profiles, roles, crops, crop lots, bookings, queue tokens, physical inspections, electronic weighments, binding offers, transactions, DBT escrow payments, grievances, weather, market prices, and audit logs.
   - Row-Level Security (RLS) policies enforcing zero data leaks between farmers and buyers.
   - Atomic SQL database functions (`accept_booking_and_generate_token`, `accept_offer_and_create_transaction`) ensuring transaction integrity.
4. **Future ML Integration Contracts (`/ml`)**:
   - Typed TypeScript service contracts and JSON schemas for OASSM-10 Transformer price forecasts, CatBoost net realization selling recommendations, and computer vision grain grading.
5. **Frontend-to-Backend Integration**:
   - Centralized HTTP client (`apiClient`) with Bearer token authorization and backend endpoint routing.
   - Unified domain services layer (`ApiCropService`, `ApiBookingService`, `ApiMarketService`, etc.) offering transparent fallback to local mock store when running offline.
6. **Testing & Continuous Integration**:
   - 26 backend test suites verifying health, auth middleware, crop lots, demand orders, queue engine, inspection, weighbridge, offers, DBT payments, notifications, and grievances.
   - 17 frontend unit tests verifying financial formatting, net realization math, queue turnaround calculation, and Zustand store synchronization.
   - Combined test suite passing 43/43 tests with 100% green status.
   - GitHub Actions CI workflow (`.github/workflows/ci.yml`) automating linting, typechecking, and testing.

---

## 2. Monorepo Structure & Directory Responsibilities

```
IIC/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Continuous Integration workflow
├── .env.example                       # Root environment variables template
├── package.json                       # Monorepo orchestration scripts
├── scripts/
│   ├── start-dev.bat                  # Launch backend and frontend concurrently (Windows)
│   ├── start-dev.sh                   # Launch backend and frontend concurrently (Unix)
│   ├── migrate.bat                    # Database migration & seed utility (Windows)
│   └── migrate.sh                     # Database migration & seed utility (Unix)
├── docs/
│   ├── PRD.md                         # Product Requirements Document
│   ├── TRD.md                         # Technical Requirements Document
│   ├── IMPLEMENTATION_PLAN.md         # Monorepo architecture & implementation plan
│   └── PHASE2_NOTES.md                # Phase 2 engineering notes & API specification
├── ml/
│   ├── README.md                      # Machine Learning architecture guide
│   └── contracts/
│       └── mlServices.contract.ts     # Typed interfaces for ML inference pipelines
├── supabase/
│   ├── migrations/
│   │   ├── 20260908000001_initial_schema.sql         # 22 relational tables & enums
│   │   ├── 20260908000002_rls_policies.sql           # Row Level Security isolation
│   │   └── 20260908000003_functions_and_triggers.sql # Atomic triggers & stored procedures
│   └── seed.sql                       # Complete development seed data
├── frontend/                          # Mobile Client (Expo SDK 57, React Native 0.86)
│   ├── src/
│   │   ├── components/                # Reusable UI widgets & cards
│   │   ├── screens/                   # 31 production screens across 5 user tabs
│   │   ├── services/
│   │   │   ├── api.ts                 # Axios-like Fetch HTTP client
│   │   │   ├── apiServices.ts         # Backend API implementations with mock fallback
│   │   │   ├── index.ts               # Primary service entrypoints
│   │   │   └── mock/                  # Standalone mock services
│   │   ├── store/                     # Zustand state store
│   │   └── types/                     # TypeScript domain models
│   ├── __tests__/                     # Frontend unit tests (17 passing)
│   └── package.json
└── backend/                           # Enterprise API Server (Express 5, Node.js 20+)
    ├── src/
    │   ├── config/                    # Environment variables, Pino logger, Supabase client
    │   ├── controllers/               # Thin HTTP handlers
    │   ├── events/                    # In-process Node EventEmitter pub/sub
    │   ├── integrations/              # Weather, market price feeds, ML stubs, DBT gateway
    │   ├── middleware/                # Auth, Role-based access, Zod validator, Rate limiter
    │   ├── repositories/              # Supabase DB queries with In-Memory fallback
    │   ├── routes/                    # Express 5 REST routing table
    │   ├── schemas/                   # Zod validation schemas
    │   ├── services/                  # Core domain logic & state machines
    │   ├── types/                     # Backend domain entities
    │   ├── utils/                     # Currency formatting, net realization math, queue engine
    │   ├── app.ts                     # Express application factory
    │   └── server.ts                  # HTTP listener on port 4000
    ├── tests/                         # Supertest test suites (26 passing)
    └── package.json
```

---

## 3. Database Schema & Row Level Security (RLS)

The database design uses PostgreSQL 15+ hosted on Supabase.

### 3.1 Relational Architecture (22 Tables)
1. **`profiles`**: Master user identity linked to Supabase Auth `auth.users(id)`.
2. **`farmers`**: Farmer profile details (aadhaar_hash, land_holding_acres, location, bank account, vehicle plate).
3. **`buyers`**: Buyer profile details (firm_name, gst_number, apmc_license_number, mandi_market_id).
4. **`markets`**: Mandi hubs (name, state, district, lat/long, counters, operating hours, fees).
5. **`crops`**: Reference agricultural commodities (Wheat, Paddy, Mustard, Tomato, Cotton, Maize).
6. **`crop_lots`**: Harvested grain lots registered by farmers with specifications and GPS tags.
7. **`lot_images`**: Camera capture angles and URLs for AI and physical grading.
8. **`buyer_demands`**: Institutional procurement orders published by buyers at Mandis.
9. **`bookings`**: Mandi gate entry appointments with vehicle plate and designated driver.
10. **`queue_tokens`**: Authoritative queue tracking tokens (`MKT-B-142`) with counter assignment.
11. **`queue_events`**: Audit log of queue movement (delays added/cleared, counter hops, check-ins).
12. **`inspections`**: Physical laboratory testing records (moisture %, foreign matter %, grain lustre, damage %).
13. **`weighments`**: Gross weight, tare weight, net weight (kg & quintals) captured at certified weighbridges.
14. **`offers`**: Legally binding procurement offers from buyers with transparent deductions.
15. **`offer_events`**: Immutable audit logs of offer creation, acceptance, and rejection.
16. **`transactions`**: Final settled grain trades with financial amounts, status, and bank reference numbers.
17. **`payments`**: DBT / Escrow disbursement tracking with UTR codes and timestamps.
18. **`notifications`**: In-app alerts for slot reminders, queue delays, offer arrivals, and payment confirmations.
19. **`grievances`**: Farmer dispute mechanism for grade disagreements or weighment discrepancies.
20. **`market_prices`**: Daily modal, minimum, and maximum wholesale mandi prices.
21. **`weather`**: Agrometeorological conditions and rainfall risks influencing harvest and transit.
22. **`audit_logs`**: Security trail capturing user identity, IP address, action, and payload changes.

### 3.2 RLS Isolation Matrix
- **Farmer Data**: A farmer authenticated via JWT can only read/write their own `crop_lots`, `bookings`, `grievances`, and `notifications`.
- **Buyer Data**: A buyer can only read/write their own `buyer_demands`, `inspections`, `weighments`, and `offers`.
- **Reference Data**: `markets`, `crops`, `market_prices`, and `weather` tables allow public read access for all authenticated users.
- **Transactions & Receipts**: Both the matching farmer (`farmer_id`) and buyer (`buyer_id`) have read access to their joint transaction record.

### 3.3 Atomic Stored Procedures
- **`accept_booking_and_generate_token`**: Atomically validates slot capacity, updates booking status to `SLOT_ASSIGNED`, and inserts a `queue_tokens` record with a unique token code (`MKT-B-XXX`).
- **`accept_offer_and_create_transaction`**: Atomically updates the offer status to `ACCEPTED`, sets the lot status to `OFFER_ACCEPTED`, and creates a `transactions` record in `PAYMENT_PENDING` status with an authoritative J-Form digital receipt reference.

---

## 4. State Machines & Business Logic

### 4.1 Booking Lifecycle State Machine
```
[REQUESTED] ──(Buyer / Mandi Assigns Slot)──> [SLOT_ASSIGNED]
     │                                               │
(Rejected)                                    (Farmer Arrives at Gate)
     │                                               │
     v                                               v
[CANCELLED]                                   [CHECKED_IN]
                                                     │
                                           (Called to Unloading Bay)
                                                     │
                                                     v
                                               [PROCESSING]
                                                     │
                                           (Settlement Completed)
                                                     │
                                                     v
                                                [COMPLETED]
```

### 4.2 Offer & Transaction Lifecycle
```
[OFFER PENDING] ────(Farmer Accepts)────> [OFFER ACCEPTED]
       │                                         │
 (Farmer Rejects)                    (Creates Transaction in DB)
       │                                         │
       v                                         v
   [REJECTED]                           [PAYMENT_PENDING]
                                                 │
                                     (Buyer Releases DBT Escrow)
                                                 │
                                                 v
                                           [PAID (Settled)]
                                                 │
                                    (Digital Receipt / J-Form Issued)
```

### 4.3 Live Queue Dynamic Departure Logic
The backend queue engine computes real-time turnaround velocity:
$$\text{Estimated Wait Minutes} = \frac{\text{Lots Ahead} \times \text{Average Minutes Per Lot}}{\text{Active Counters}} + \text{Gate Delay}$$
$$\text{Buffer Minutes} = \text{Transit Time} + \text{Estimated Wait Minutes}$$

**Departure Recommendations**:
- If `operator_delay_minutes > 0`: **`WAIT`** ("Hold departure. Unloading bay bottleneck reported at Mandi Gate.")
- If `Buffer Minutes >= 45` minutes until slot window: **`LEAVE_NOW`** ("Clear traffic window. Depart immediately.")
- If `Buffer Minutes < 45` minutes and `delay == 0`: **`ON_SCHEDULE`** ("Pack vehicle. Target departure in 15 mins.")

---

## 5. REST API Specifications (`/api/v1`)

### 5.1 Authentication & Profile
| Method | Path | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | System status, version, uptime, and database connectivity. |
| `GET` | `/api/v1/auth/me` | Authenticated | Returns current profile (`farmer`, `buyer`, or `operator`). |
| `POST` | `/api/v1/auth/role` | Authenticated | Updates or provisions user role. |

### 5.2 Crop Lots & Mandi Demands
| Method | Path | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/farmers/lots` | Farmer | Returns active and historical lots owned by the farmer. |
| `POST` | `/api/v1/farmers/lots` | Farmer | Registers a new lot with variety, quantity, and photos. |
| `GET` | `/api/v1/lots/:id` | Authenticated | Fetches lot details by UUID. |
| `GET` | `/api/v1/lots/:id/recommendations` | Authenticated | Calculates True Net Realization across Mandis. |
| `GET` | `/api/v1/demands` | Authenticated | Lists active buyer demand orders. |
| `POST` | `/api/v1/buyers/demands` | Buyer | Creates a procurement demand with price range and grade. |

### 5.3 Bookings & Live Queue Management
| Method | Path | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/farmers/bookings` | Farmer | Fetches farmer gate appointments. |
| `POST` | `/api/v1/farmers/bookings` | Farmer | Requests an entry slot with vehicle and driver info. |
| `POST` | `/api/v1/buyers/bookings/:id/accept` | Buyer/Operator | Approves booking and issues queue token. |
| `POST` | `/api/v1/bookings/:id/checkin` | Authenticated | Records vehicle arrival at the Mandi gate. |
| `GET` | `/api/v1/bookings/:id/queue` | Authenticated | Computes live queue position, ETA, and departure advice. |
| `POST` | `/api/v1/queue/delay` | Buyer/Operator | Broadcasts gate delay adjustments (+20 mins). |
| `POST` | `/api/v1/queue/clear-delay` | Buyer/Operator | Clears gate delays and resumes standard velocity. |

### 5.4 Physical Grading, Weighbridge & Settlement
| Method | Path | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/inspections` | Buyer/Operator | Records moisture %, foreign matter %, and grade. |
| `GET` | `/api/v1/inspections/booking/:bookingId` | Authenticated | Fetches physical grading report for a booking. |
| `POST` | `/api/v1/weighments` | Buyer/Operator | Logs gross weight, tare weight, and calculates net kg. |
| `GET` | `/api/v1/weighments/booking/:bookingId` | Authenticated | Retrieves certified weighment slip. |
| `POST` | `/api/v1/offers` | Buyer | Submits binding price offer with transparent deductions. |
| `POST` | `/api/v1/offers/:id/accept` | Farmer | Farmer accepts offer; creates transaction in `PAYMENT_PENDING`. |
| `POST` | `/api/v1/payments/release/:txnId` | Buyer | Releases DBT escrow payment to farmer's bank account. |
| `GET` | `/api/v1/transactions/:id/receipt` | Authenticated | Issues digital J-Form receipt with audit hash. |

### 5.5 Notifications & Dispute Management
| Method | Path | Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notifications` | Authenticated | Fetches user notifications. |
| `PATCH` | `/api/v1/notifications/:id/read`| Authenticated | Marks single notification as read. |
| `POST` | `/api/v1/notifications/read-all`| Authenticated | Marks all notifications as read. |
| `POST` | `/api/v1/grievances` | Authenticated | Submits formal dispute on grading or weighment. |
| `GET` | `/api/v1/grievances` | Authenticated | Fetches grievance status and resolution trail. |

---

## 6. Future Machine Learning Hooks (`/ml`)

The `/ml` directory provides the contracts and interface points for three planned AI services:

### 6.1 OASSM-10 Transformer Price Predictor
- **File**: `ml/contracts/mlServices.contract.ts`
- **Method**: `predictMarketPrices(request: PriceForecastRequest): Promise<PriceForecastResponse>`
- **Inputs**: Historical APMC wholesale modal prices, harvest seasonality, district rainfall anomaly, and diesel freight indices.
- **Output**: 7-day, 14-day, and 30-day forecast with 80% and 95% confidence intervals.

### 6.2 CatBoost True Net Realization Decision Engine
- **Method**: `recommendSellingDecision(request: RecommendationRequest): Promise<RecommendationResponse>`
- **Inputs**: Distance to alternative mandis (Taraori vs Karnal vs Kurukshetra), local mandi cess (1.5%), loading/unloading rates, queue congestion delays, and buyer demand liquidity.
- **Output**: `action: 'SELL_NOW' | 'WAIT' | 'PARTIAL_SELL'`, recommended destination mandi, expected net in-hand payout, and explanatory rationale.

### 6.3 Computer Vision Grain Quality Classifier
- **Method**: `assessLotQuality(request: QualityAssessmentRequest): Promise<QualityAssessmentResponse>`
- **Inputs**: High-resolution RGB multi-angle camera images of grain lot.
- **Output**: Predicted grade (`Grade A`, `Grade B`, `Grade C`), moisture estimation, foreign matter % estimate, and feature confidence tags.

---

## 7. Persona Verification & Demo Accounts

| Persona | Name | Role | Location / Mandi | Default Demo Token |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer** | Rajesh Kumar | `FARMER` | Taraori, Karnal (HR-05-AB-1234) | `demo-farmer-token` |
| **Buyer** | Anil Sharma | `BUYER` | Taraori APMC Mandi (Counter 4) | `demo-buyer-token` |
| **Operator** | Mandi Admin | `OPERATOR` | Taraori Weighbridge & Gate 2 | `demo-operator-token` |

---

## 8. Verification Results

| Target | Test Suite | Tests Run | Result | Notes |
| :--- | :--- | :---: | :---: | :--- |
| **Backend** | Health Check Endpoint | 1 | **PASS** | 200 OK with runtime diagnostics |
| **Backend** | Auth & Role Middleware | 5 | **PASS** | JWT verification, demo tokens, 401/403 isolation |
| **Backend** | Crop Lots & Demands API | 5 | **PASS** | Zod validation, 422 errors, net payout math |
| **Backend** | Booking & Queue Dynamic Engine | 6 | **PASS** | Slot assignment, delays, gate passes, ETAs |
| **Backend** | Inspection, Weighment, Offer & DBT | 6 | **PASS** | Gross/tare scale, offer acceptance, escrow, receipts |
| **Backend** | Notifications & Grievance Dispute | 3 | **PASS** | Notification read status, grievance filing |
| **Frontend** | Financial Display & Math Logic | 3 | **PASS** | Rupee formatting, edge-case parsing |
| **Frontend** | True Net Realization Logic | 2 | **PASS** | Freight & cess optimization proof |
| **Frontend** | Queue Velocity & Turnaround Timing | 2 | **PASS** | Dynamic queue turnaround calculation |
| **Frontend** | Mock Store Persona Synchronization | 10 | **PASS** | End-to-end multi-persona walkthrough |
| **Frontend** | TypeScript Compilation (`tsc --noEmit`)| - | **PASS** | 0 TypeScript errors across 31 screens |
| **Backend** | TypeScript Compilation (`tsc --noEmit`)| - | **PASS** | 0 TypeScript errors across all backend modules |
| **Total** | **Combined Test Suite** | **43** | **PASS** | **100% Pass Rate** |
