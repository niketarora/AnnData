# KrishiNetra 2.0 — AgriFintech Operating System

> **Next-Generation Post-Harvest Mandi Logistics, AI Quality Grading, and DBT Escrow Settlement**

---

## Architecture Overview

KrishiNetra 2.0 transforms post-harvest agricultural commerce through an integrated end-to-end platform connecting Farmers, Mandi Traders/Commission Agents, and APMC Operators:

```
                                  [ Mobile Application ]
                         (React Native 0.86 / Expo SDK 57)
                                       │
                         REST API Requests / Bearer Token
                                       │
                                       ▼
                       [ KrishiNetra Backend API ]
                       (Express 5 / Node.js 20+ ESM)
           ┌───────────────────────────┼───────────────────────────┐
           ▼                           ▼                           ▼
[ Supabase PostgreSQL ]    [ ML Prediction Layer ]     [ In-Memory Store ]
   - 22 Relational Tables     - OASSM-10 Transformer      - Zero-Dependency Dev
   - Row-Level Security       - CatBoost Realization      - Deterministic Tests
   - Atomic Stored Procs      - Computer Vision Grading   - Instant Boot
```

---

## Repository Organization

```
.
├── frontend/             # Mobile Client (Expo SDK 57, React Native 0.86, TypeScript)
│   ├── src/              # 31 UI screens, reusable components, store & API client
│   └── __tests__/        # Unit test suite (17 tests)
├── backend/              # Enterprise Backend (Express 5, TypeScript ESM, Zod, Pino)
│   ├── src/              # Controllers, services, repositories, middleware, events
│   └── tests/            # Supertest API test suites (26 tests)
├── supabase/             # Database Layer
│   ├── migrations/       # Schema (22 tables), RLS policies, atomic functions
│   └── seed.sql          # Development seed data
├── ml/                   # Future Machine Learning Integrations
│   ├── README.md         # ML pipeline architecture & mathematical formulations
│   └── contracts/        # Typed TypeScript contracts & inference schemas
├── docs/                 # Documentation
│   ├── PRD.md            # Product Requirements Document
│   ├── TRD.md            # Technical Requirements Document
│   └── PHASE2_NOTES.md   # Phase 2 Engineering Notes & API Specifications
├── scripts/              # Developer Convenience Scripts
│   ├── start-dev.bat     # Windows launcher (starts backend + Expo)
│   ├── start-dev.sh      # Unix launcher
│   ├── migrate.bat       # Database migration utility (Windows)
│   └── migrate.sh        # Database migration utility (Unix)
└── .github/workflows/    # GitHub Actions Continuous Integration (ci.yml)
```

---

## Quickstart Guide

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v9.x or higher

### 1. Installation

Install dependencies for all workspaces:
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Return to root
cd ..
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default values work out-of-the-box for local development. In local/test mode, the backend automatically runs with an in-memory PostgreSQL store seeded from `supabase/seed.sql` — no remote database connection required to get started.

### 3. Running Development Servers

Start both the backend API and frontend Expo bundler:
- **Windows**: Double-click or run `scripts\start-dev.bat`
- **Linux / macOS**: Run `./scripts/start-dev.sh`

Or launch them individually from the root:
```bash
# Terminal 1: Backend API (Port 4000)
npm run start:backend

# Terminal 2: Frontend Mobile App (Expo Metro Bundler)
npm run start:frontend
```

---

## Verification & Testing

KrishiNetra 2.0 features comprehensive test automation across both the mobile client and backend server:

```bash
# Run all tests across frontend and backend (43/43 tests)
npm test

# Run TypeScript typechecks across both frontend and backend
npm run typecheck
```

### Individual Workspaces:
```bash
# Backend tests (26 tests across 6 suites)
npm run test:backend

# Frontend unit tests (17 tests across 4 suites)
npm run test:frontend
```

---

## Demo Personas & Tokens

For testing and local development, the backend accepts convenient demo bearer tokens:

| Persona | Name | Role | Location / Mandi | Demo Token |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer** | Rajesh Kumar | `FARMER` | Taraori, Karnal (HR-05-AB-1234) | `demo-farmer-token` |
| **Buyer** | Anil Sharma | `BUYER` | Taraori APMC Mandi (Counter 4) | `demo-buyer-token` |
| **Operator** | Mandi Admin | `OPERATOR` | Taraori Gate 2 & Weighbridge | `demo-operator-token` |

Example request using `curl`:
```bash
curl -H "Authorization: Bearer demo-farmer-token" http://localhost:4000/api/v1/farmers/lots
```

---

## Key Backend REST APIs

| Group | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/health` | System health, version, and environment |
| **Auth** | `GET` | `/api/v1/auth/me` | Authenticated user profile and role |
| **Lots** | `GET` | `/api/v1/farmers/lots` | Farmer's registered harvest lots |
| **Lots** | `POST` | `/api/v1/farmers/lots` | Register new lot with images & specs |
| **Demands** | `GET` | `/api/v1/demands` | Active APMC buyer demand orders |
| **Demands** | `POST` | `/api/v1/buyers/demands` | Buyer creates procurement demand |
| **Bookings**| `POST` | `/api/v1/farmers/bookings` | Farmer requests mandi slot |
| **Bookings**| `POST` | `/api/v1/buyers/bookings/:id/accept` | Buyer accepts slot & issues token |
| **Queue** | `GET` | `/api/v1/bookings/:id/queue` | Real-time turnaround ETA & advice |
| **Queue** | `POST` | `/api/v1/queue/delay` | Operator broadcasts gate congestion (+20m) |
| **Grading** | `POST` | `/api/v1/inspections` | Record physical laboratory assay |
| **Weighing**| `POST` | `/api/v1/weighments` | Record gross/tare weighbridge scale |
| **Offers** | `POST` | `/api/v1/offers` | Buyer issues legally binding offer |
| **Offers** | `POST` | `/api/v1/offers/:id/accept` | Farmer accepts offer -> Payment pending |
| **Payments**| `POST` | `/api/v1/payments/release/:id` | Buyer releases DBT escrow payout |
| **Receipts**| `GET` | `/api/v1/transactions/:id/receipt` | Authoritative J-Form receipt |
| **Disputes**| `POST` | `/api/v1/grievances` | Farmer disputes grading or scale reading |

---

## Database Migrations & Supabase

SQL migrations are located in `supabase/migrations/`:
- `20260908000001_initial_schema.sql`: 22 tables, custom enums, and foreign keys.
- `20260908000002_rls_policies.sql`: Row-Level Security policies isolating user roles.
- `20260908000003_functions_and_triggers.sql`: Triggers and atomic stored procedures.
- `seed.sql`: Realistic seed data with Mandi facilities, crops, and initial lots.

To apply migrations to a live Supabase project:
```bash
# Windows
scripts\migrate.bat

# Unix
./scripts/migrate.sh
```

---

## Continuous Integration

Every push and pull request is automatically verified by GitHub Actions (`.github/workflows/ci.yml`):
- Node.js 20 environment matrix
- Backend TypeScript compilation & Supertest suites
- Frontend TypeScript compilation & Jest unit tests

---

## License

Proprietary — KrishiNetra Team © 2026. All rights reserved.
