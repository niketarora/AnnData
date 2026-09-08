# TRD — AgriFintech Operating System

## 1. Technical Objective

Build a mobile-first, two-role agricultural fintech platform using the same core technology stack as KrishiNetra 2.0.

The architecture must support:

- Farmer and buyer roles
- PostgreSQL persistence
- Authentication
- File storage
- Realtime events
- REST APIs
- ML service integration
- Dynamic recommendations
- Queue recalculation
- Notifications
- Auditable transaction state

---

# 2. Technology Stack

## Mobile Application

- React Native 0.86
- Expo SDK 57
- TypeScript
- React Navigation v7
- React Native Reanimated
- Mapbox
- Expo Location
- Expo Camera
- Expo Audio
- i18next
- react-i18next

## Backend

- Node.js >=20
- Express 5
- TypeScript/JavaScript
- Zod

## Database / Platform

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Supabase Row Level Security
- Supabase Realtime

## Local / Large Dataset Support

- SQLite for large/static mandi datasets where required

## ML / AI

- Python 3.11+
- FastAPI
- OASSM-10 Transformer
- CatBoost
- Google Gemini
- Gemini Multimodal Live API
- Sarvam AI

## Geospatial

- Mapbox
- Turf.js
- OpenStreetMap / Nominatim where required

## External Data

- Open-Meteo
- data.gov.in / AGMARKNET
- NDMA SACHET
- Google News RSS
- ISRO / Sentinel datasets where required by later intelligence modules

## AI Search / Agent Layer

- Lyzr AI
- Tavily

## Testing

- Jest
- React Native Testing Library

## Deployment

- Expo EAS
- Docker
- GitHub

---

# 3. Architecture

```text
                    React Native + Expo
                            │
                     React Navigation
                            │
                ┌───────────▼───────────┐
                │  Application State    │
                │  API Client           │
                │  Realtime Client      │
                └───────────┬───────────┘
                            │
                    HTTPS / Realtime
                            │
                 ┌──────────▼──────────┐
                 │ Node.js + Express   │
                 │ Auth / RBAC         │
                 │ Validation / Zod    │
                 │ Business Services   │
                 │ Queue Engine        │
                 │ Recommendation API  │
                 └──────┬────────┬─────┘
                        │        │
              ┌─────────▼───┐ ┌──▼────────────┐
              │  Supabase   │ │ Python/FastAPI│
              │ PostgreSQL  │ │ ML Services   │
              │ Auth        │ │ Quality       │
              │ Storage     │ │ Price         │
              │ Realtime    │ │ Prediction    │
              │ RLS         │ └───────────────┘
              └─────────────┘
```

---

# 4. Recommended Repository Structure

```text
app/
├── mobile/
│   ├── app/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   │   ├── farmer/
│   │   │   └── buyer/
│   │   ├── navigation/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── i18n/
│   │   └── theme/
│   └── assets/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── realtime/
│   │   ├── queue/
│   │   └── utils/
│   └── tests/
│
├── ml/
│   ├── quality/
│   ├── price/
│   ├── recommendation/
│   └── api/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
│
└── docs/
```

---

# 5. Database Schema

## users

```text
id UUID PK
role ENUM(FARMER, BUYER, OPERATOR)
name
phone
language
location
verified
created_at
```

## farmer_profiles

```text
user_id FK
farm_location
preferred_radius_km
vehicle_type
```

## buyer_profiles

```text
user_id FK
organization_name
market_name
location
verification_status
payment_reliability_score
```

## crop_lots

```text
id UUID PK
farmer_id FK
crop
variety
quantity
unit
harvest_date
location
status
created_at
```

## lot_images

```text
id UUID PK
lot_id FK
image_url
capture_type
created_at
```

## quality_assessments

```text
id UUID PK
lot_id FK
quality_score
predicted_grade
moisture
damage_score
uniformity_score
foreign_matter_score
confidence
model_version
created_at
```

## market_demands

```text
id UUID PK
buyer_id FK
crop
variety
minimum_grade
quantity_required
quantity_remaining
price_min
price_max
date
daily_capacity
status
```

## market_metrics

```text
market_id
timestamp
queue_length
avg_processing_minutes
active_counters
arrival_volume
delay_minutes
crowd_level
```

## recommendations

```text
id UUID PK
lot_id FK
buyer_or_market_id FK
expected_price
distance_km
transport_cost
wait_minutes
estimated_net_realization
recommendation_score
rank
reason
created_at
```

## bookings

```text
id UUID PK
lot_id FK
buyer_id FK
token
slot_start
slot_end
revised_processing_time
recommended_departure_time
status
qr_data
created_at
updated_at
```

## queue_events

```text
id UUID PK
booking_id FK
event_type
old_status
new_status
delay_minutes
timestamp
```

## inspections

```text
id UUID PK
booking_id FK
ai_grade
physical_grade
moisture
damage
notes
inspected_by
created_at
```

## weighments

```text
id UUID PK
booking_id FK
expected_quantity
final_weight
unit
recorded_by
created_at
```

## offers

```text
id UUID PK
booking_id FK
final_grade
price_per_unit
gross_amount
deductions
net_amount
status
created_at
```

## transactions

```text
id UUID PK
booking_id FK
offer_id FK
payment_status
payment_mode
payment_reference
created_at
updated_at
```

## notifications

```text
id UUID PK
user_id FK
type
title
message
booking_id
read
created_at
```

---

# 6. Database Relationships

```text
users
 ├── farmer_profiles
 └── buyer_profiles

farmer_profiles
 └── crop_lots
       ├── lot_images
       ├── quality_assessments
       └── recommendations
              │
              └── bookings
                    ├── queue_events
                    ├── inspections
                    ├── weighments
                    ├── offers
                    └── transactions

buyer_profiles
 └── market_demands

users
 └── notifications
```

---

# 7. Authentication

Use Supabase Auth.

Roles:

```text
FARMER
BUYER
OPERATOR
```

The mobile app obtains the authenticated Supabase session.

The backend validates the access token and role.

Never trust a client-supplied role.

---

# 8. RLS Requirements

Farmers can read/write only their own:

- Profiles
- Crop lots
- Lot images
- Quality assessments
- Recommendations
- Bookings
- Offers associated with their bookings
- Transactions associated with their bookings
- Notifications

Buyers can access only:

- Their profile
- Their demands
- Incoming lots relevant to their markets
- Their bookings
- Their queue
- Their inspections
- Their offers
- Their transactions

Operators get operational permissions according to assigned market.

---

# 9. REST API

## Farmer

```http
POST /lots
POST /lots/:lotId/images
POST /lots/:lotId/quality-assessment
GET  /lots/:lotId/recommendations
GET  /markets/:marketId
POST /bookings
GET  /bookings/:bookingId
POST /bookings/:bookingId/check-in
GET  /bookings/:bookingId/queue-status
POST /transactions/:id/accept-offer
GET  /farmer/sales
GET  /farmer/notifications
```

## Buyer

```http
POST /buyer/demands
GET  /buyer/demands
PATCH /buyer/demands/:id
GET  /buyer/lots
POST /buyer/lots/:lotId/accept
POST /buyer/lots/:lotId/reject
POST /buyer/lots/:lotId/request-inspection
POST /buyer/bookings/:id/assign-slot
PATCH /buyer/queue/:bookingId
POST /buyer/queue/delay
POST /buyer/inspection/:bookingId
POST /buyer/weighment/:bookingId
POST /buyer/transactions/:bookingId/offer
POST /buyer/transactions/:id/payment
```

---

# 10. Realtime Channels

```text
booking:{bookingId}
market:{marketId}:queue
buyer:{buyerId}:incoming-lots
user:{userId}:notifications
```

Use Supabase Realtime for persistence-driven state changes.

The client must update local state from realtime events rather than requiring a full-screen refresh.

---

# 11. Queue Engine

Queue calculation service inputs:

```text
queue_length
lots_ahead
avg_processing_minutes
active_counters
delay_minutes
slot_time
farmer_eta
safety_buffer
```

Initial calculation:

```text
processing_delay =
lots_ahead * avg_processing_minutes / active_counters
```

Then:

```text
revised_processing_time =
slot_time + processing_delay + current_market_delay
```

Departure:

```text
departure_time =
revised_processing_time - travel_eta - safety_buffer
```

The service must recalculate whenever:

- A lot is checked in
- Processing starts
- Processing completes
- Counter count changes
- Delay is added
- Delay is removed
- No-show occurs
- Booking is cancelled
- Market intake is paused/resumed

---

# 12. Recommendation Engine

Inputs:

```text
expected_price
quality
demand
distance
travel_time
transport_cost
waiting_time
buyer_reliability
payment_terms
price_confidence
quantity
```

Calculate:

```text
gross =
expected_price * quantity

net =
gross
- transport_cost
- loading_unloading_cost
- waiting_cost
- other_costs
```

Normalize each market metric before calculating the configurable score.

Return:

```json
{
  "marketId": "B",
  "expectedPrice": 2500,
  "distanceKm": 20,
  "transportCost": 750,
  "waitMinutes": 25,
  "estimatedNetRealization": 48850,
  "recommendationScore": 0.89,
  "rank": 1,
  "reason": "Higher estimated net realization with lower congestion."
}
```

---

# 13. ML Service Integration

The mobile/backend application should not directly embed ML model logic.

Use:

```text
Node/Express
    ↓
FastAPI ML endpoint
    ↓
Model inference
    ↓
Structured response
    ↓
PostgreSQL
```

Quality service should return:

```text
quality_score
predicted_grade
confidence
moisture
damage_score
uniformity_score
foreign_matter_score
model_version
```

The application must label this as preliminary.

---

# 14. Maps

Use Mapbox for:

- Current farmer location
- Market locations
- Distance
- Route
- ETA

Use Turf.js for geospatial calculations where required.

Keep route/ETA calculations in a service layer so the UI remains independent of the map provider.

---

# 15. State Management

Create domain-level state rather than one giant global store.

Recommended domains:

```text
auth
farmer
buyer
lots
quality
markets
recommendations
bookings
queue
demands
transactions
notifications
```

Realtime events update the corresponding domain state.

---

# 16. API/Data Rule

No business-critical data should be hardcoded inside UI components.

Bad:

```ts
const price = 2500;
const queue = 3;
const delay = 45;
```

Good:

```text
API / Supabase
    ↓
Service / Repository
    ↓
Typed state
    ↓
Component
```

Mock/demo data must live in seed JSON/database fixtures.

---

# 17. Design System Implementation

Use the supplied Stitch design system.

### Canvas

`#F7F9F7`

### Card

`#FFFFFF`

### Primary

`#1F8A4C`

### Dark green

`#146B3A`

### Text

`#17201A`

### Secondary text

`#66736A`

### Border

`#E5EAE6`

### Warning

`#D97706`

### Danger

`#DC2626`

### Info

`#2563EB`

Typography:

- Plus Jakarta Sans for headings/currency
- Inter for body and operational data

Minimum touch target:

`48px`

Mobile horizontal gutter:

`16px`

Card radius:

`12–16px`

---

# 18. Navigation

## Farmer

```text
Home
Sell
Markets
Bookings
Profile
```

## Buyer

```text
Dashboard
Demand
Lots
Queue
Transactions
```

Use React Navigation with role-specific navigation trees.

---

# 19. Notification Architecture

```text
Business Event
     ↓
Notification Service
     ↓
notifications table
     ↓
Supabase Realtime
     ↓
Mobile Notification Center
```

For production push delivery, connect Firebase Cloud Messaging through the notification service.

---

# 20. Error Handling

API responses should use a consistent shape:

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_SLOT_UNAVAILABLE",
    "message": "This slot is no longer available."
  }
}
```

Mobile UI converts technical errors into user-friendly messages.

---

# 21. Idempotency

Critical actions should be idempotent:

- Accept lot
- Assign slot
- Generate token
- Check-in
- Submit inspection
- Confirm weighment
- Submit offer
- Accept offer
- Mark payment

Prevent double submission using transaction checks and unique constraints.

---

# 22. Audit Trail

Every important transition creates an event.

Example:

```text
booking
B-142

SLOT_ASSIGNED
→ WAIT
→ LEAVE_NOW
→ ARRIVING
→ CHECKED_IN
→ INSPECTION
→ SALE
→ PAYMENT
→ COMPLETE
```

Never overwrite history when an operational state changes.

---

# 23. Security

- Store secrets only in environment variables.
- Never expose service-role Supabase keys to the mobile app.
- Validate every API request with Zod.
- Validate authenticated user.
- Validate role.
- Enforce ownership.
- Use RLS.
- Restrict storage buckets.
- Do not expose private farmer information.
- Log security-sensitive operations.

---

# 24. Performance

Target:

- Fast first screen
- Lazy-load heavy screens
- Compress crop images before upload
- Paginate transaction and lot lists
- Avoid unnecessary realtime subscriptions
- Subscribe only to relevant market/booking/user channels
- Cache stable market metadata
- Debounce search/filter inputs

---

# 25. Offline/Weak Network Behavior

Because farmer usage may happen in the field:

- Show network state.
- Cache last known booking/token.
- Cache basic market information.
- Keep QR token accessible offline once issued.
- Queue non-critical telemetry for later synchronization.
- Never silently claim a transaction is completed if server confirmation is unavailable.

---

# 26. Testing Strategy

### Unit

- Recommendation scoring
- Net realization
- Queue calculation
- Departure calculation
- Status transition rules

### Component

- Farmer dashboard
- Recommendation card
- Queue status card
- Buyer KPI cards
- Queue items
- Offer card

### Integration

- Lot creation
- Booking
- Acceptance
- Slot assignment
- Inspection
- Weighment
- Offer
- Payment

### E2E

Primary cross-user flow:

```text
Farmer → Buyer → Farmer → Buyer → Farmer
```

---

# 27. Observability

Log:

- API failures
- Booking transition failures
- Realtime subscription failures
- ML inference errors
- Payment state failures
- Queue calculation errors

Do not log sensitive personal data unnecessarily.
