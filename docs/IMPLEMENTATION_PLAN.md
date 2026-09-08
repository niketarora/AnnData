# IMPLEMENTATION PLAN — AgriFintech Operating System

## 1. Implementation Objective

Implement the entire farmer + buyer workflow in one coordinated build using:

- React Native 0.86
- Expo SDK 57
- TypeScript
- React Navigation v7
- Reanimated
- Mapbox
- Supabase
- PostgreSQL
- Node.js >=20
- Express 5
- Zod
- Python/FastAPI ML services
- Gemini / Gemini Live / Sarvam AI where required
- Jest + React Native Testing Library
- Expo EAS + Docker

The supplied Stitch screens and `DESIGN.md` are the visual source of truth for the design language.

Do not replace the supplied visual direction with a generic dashboard template.

---

# 2. Golden Rule

Build the product as:

```text
DATA
 ↓
DATABASE
 ↓
API / SERVICE
 ↓
TYPED STATE
 ↓
UI
```

Never:

```text
HARDCODED DATA
 ↓
UI
```

All demo values should come from seed data, mock services, or database records so they can later be replaced by production services.

---

# 3. Phase 0 — Inspect Existing Project

Before changing code:

1. Inspect repository structure.
2. Identify current Expo/React Native version.
3. Identify navigation setup.
4. Identify Supabase setup.
5. Identify existing theme/components.
6. Identify existing authentication.
7. Identify existing API/ML integrations.
8. Identify existing screens.
9. Compare current implementation with the supplied Stitch design package.
10. Reuse working components instead of duplicating them.

Do not destroy existing working functionality.

---

# 4. Phase 1 — Establish Foundation

## 4.1 Environment

Create environment variables for:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
BACKEND_URL
MAPBOX_TOKEN
GEMINI_API_KEY
SARVAM_API_KEY
TAVILY_API_KEY
LYZR_API_KEY
```

Only expose client-safe variables to the mobile application.

---

## 4.2 Project Structure

Create:

```text
src/
├── components/
├── screens/
│   ├── farmer/
│   └── buyer/
├── navigation/
├── services/
├── repositories/
├── hooks/
├── store/
├── types/
├── utils/
├── theme/
└── i18n/
```

Backend:

```text
backend/src/
├── routes/
├── controllers/
├── services/
├── repositories/
├── middleware/
├── validators/
├── queue/
├── realtime/
└── utils/
```

---

# 5. Phase 2 — Theme and Design System

Implement the Stitch design system before building screens.

Create:

```text
theme/colors.ts
theme/typography.ts
theme/spacing.ts
theme/radius.ts
theme/shadows.ts
```

Core tokens:

```text
Canvas #F7F9F7
Card #FFFFFF
Primary #1F8A4C
Dark Green #146B3A
Light Green #EAF7EF
Text #17201A
Secondary #66736A
Border #E5EAE6
Warning #D97706
Warning Tint #FEF3C7
Danger #DC2626
Danger Tint #FEE2E2
Info #2563EB
Info Tint #EFF6FF
```

Implement reusable:

- Button
- Card
- StatusChip
- SectionHeader
- CurrencyDisplay
- KPI card
- Input
- EmptyState
- LoadingSkeleton
- ErrorState
- BottomSheet
- Toast
- Badge

---

# 6. Phase 3 — Supabase Database

Create migrations for:

```text
users
farmer_profiles
buyer_profiles
crop_lots
lot_images
quality_assessments
market_demands
market_metrics
recommendations
bookings
queue_events
inspections
weighments
offers
transactions
notifications
```

Add:

- Primary keys
- Foreign keys
- Indexes
- Status enums/check constraints
- Timestamps
- Unique constraints
- RLS policies

---

# 7. Phase 4 — Seed Demo Data

Create deterministic demo data.

Example farmer:

```text
Farmer
Wheat
20 QTL
Grade A
Quality 88
```

Markets:

```text
Market A
10 km
₹2,390
High crowd

Market B
20 km
₹2,500
Low crowd
6 slots

Market C
30 km
₹2,560
Medium crowd
```

Buyer:

```text
Market B
Wheat demand
500 QTL capacity
```

Booking:

```text
Token: MKT-B-142
Slot: 3:30–4:00 PM
```

The seed data must be stored in the database or mock repository.

---

# 8. Phase 5 — Authentication and Roles

Implement:

```text
Login
 ↓
Role
 ├── Farmer
 └── Buyer/Operator
```

Create role-specific navigation.

Ensure:

```text
Farmer cannot access buyer operations.
Buyer cannot access farmer private data.
```

---

# 9. Phase 6 — Farmer Dashboard

Implement the supplied Stitch farmer dashboard visual direction.

Components:

```text
FarmerHeader
ActiveCropCard
RecommendationCard
BookingStatusCard
QueueDecisionCard
FinancialSummary
QuickActions
RecentActivity
```

Dashboard must be driven by APIs/state.

---

# 10. Phase 7 — Create Crop Lot

Flow:

```text
Sell
 ↓
Create Lot
 ↓
Crop
Variety
Quantity
Harvest Date
Location
Vehicle
 ↓
Upload Images
```

Use:

- Expo Camera
- Supabase Storage
- Image compression

Store image URLs in `lot_images`.

---

# 11. Phase 8 — Quality Assessment

After image upload:

```text
POST /lots/:lotId/quality-assessment
```

Backend calls ML service.

Response:

```json
{
  "qualityScore": 88,
  "predictedGrade": "A",
  "confidence": 0.91,
  "moisture": 11.8,
  "damageScore": 0.08,
  "modelVersion": "v1"
}
```

Store the result.

Display:

```text
Grade A
88/100
91% confidence
```

Clearly label as preliminary.

---

# 12. Phase 9 — Price / Recommendation Engine

After quality assessment:

```text
Lot
 ↓
Market data
 ↓
Demand
 ↓
Distance
 ↓
Transport
 ↓
Queue
 ↓
Net realization
 ↓
Recommendation
```

Create a backend service:

```text
recommendationService
```

Return ranked markets.

The farmer UI must explain the recommendation.

---

# 13. Phase 10 — Farmer Market Screens

Implement:

### Market Comparison

Show:

- Price
- Net realization
- Distance
- Demand
- Crowd
- Wait
- Slots
- Recommendation

### Market Details

Show:

- Map
- Route
- Demand
- Accepted grades
- Queue
- Facilities
- Payment terms
- Booking slots

---

# 14. Phase 11 — Booking

Farmer:

```text
Select Market
 ↓
Select Date
 ↓
Select Slot
 ↓
Request Slot
```

Backend validates:

- Slot capacity
- Buyer capacity
- Demand compatibility
- Lot ownership
- Booking conflicts

Create booking with:

```text
REQUESTED
```

---

# 15. Phase 12 — Buyer Incoming Lots

Buyer receives realtime event.

Implement:

```text
Buyer Dashboard
 ↓
Incoming Lots
 ↓
Lot Details
```

Actions:

```text
Accept
Reject
Request Photos
Request Inspection
```

Accepting must reserve capacity transactionally.

---

# 16. Phase 13 — Slot Assignment

Buyer selects:

```text
Date
Slot
Counter/capacity
```

Backend:

1. Verify capacity.
2. Assign slot.
3. Generate unique token.
4. Generate QR payload.
5. Update booking.
6. Create queue event.
7. Notify farmer.

Farmer sees:

```text
BOOKING CONFIRMED
MKT-B-142
3:30–4:00 PM
```

---

# 17. Phase 14 — Realtime Queue

Implement Supabase Realtime subscriptions.

Buyer can:

```text
Start Processing
Complete
Delay +10
Delay +20
Delay +30
No Show
Move Queue
Open Counter
Close Counter
Pause Intake
```

Every action creates a `queue_event`.

The queue service recalculates:

```text
queue length
lots ahead
processing ETA
delay
recommended departure
```

---

# 18. Phase 15 — Farmer WAIT / LEAVE NOW State Machine

Implement a single source of truth for departure state.

```text
WAIT
 ↓
GET_READY
 ↓
LEAVE_NOW
 ↓
ARRIVING
 ↓
CHECKED_IN
```

Allow:

```text
DELAYED
EARLY
```

The farmer screen should react automatically to realtime queue updates.

Use the supplied Stitch visual pattern for the dynamic decision banner.

---

# 19. Phase 16 — Check-In

Farmer opens:

```text
Token / QR
```

At market:

```text
Scan QR
 ↓
Validate booking
 ↓
CHECKED_IN
```

Create queue event.

Buyer immediately sees the farmer as checked in.

---

# 20. Phase 17 — Inspection

Buyer opens lot.

Display:

```text
AI Grade
Physical Grade
Moisture
Damage
Notes
```

Save inspection.

Do not overwrite AI grade.

---

# 21. Phase 18 — Weighment

Buyer enters:

```text
Final Weight
```

Validate:

- Numeric
- Positive
- Reasonable range
- Booking still active

Save weighment.

---

# 22. Phase 19 — Final Offer

Calculate:

```text
Gross = finalWeight × rate
Net = gross - deductions
```

Create offer:

```text
OFFERED
```

Notify farmer realtime.

---

# 23. Phase 20 — Farmer Offer Decision

Farmer sees:

```text
FINAL OFFER

Grade A
19.7 QTL
₹2,485/QTL

Gross ₹48,954.50
Deductions ₹300
Net ₹48,654.50
```

Actions:

```text
Accept
Reject
Request Clarification
```

Accepting creates:

```text
ACCEPTED
```

---

# 24. Phase 21 — Payment

Buyer/operator updates payment state:

```text
PAYMENT_PENDING
 ↓
PAID
 ↓
COMPLETE
```

Store payment reference.

Farmer receives notification.

---

# 25. Phase 22 — Receipt and Sales History

Generate transaction detail:

```text
Crop
Quantity
Grade
Rate
Gross
Deductions
Net
Payment
Buyer
Date
Transaction ID
```

Farmer can open digital receipt.

---

# 26. Phase 23 — Notifications

Build notification repository/service.

Create notifications for every important state transition.

Examples:

```text
SLOT_ASSIGNED
QUEUE_DELAY
LEAVE_NOW
CHECKED_IN
OFFER_RECEIVED
PAYMENT_COMPLETED
```

Realtime notification badge should update immediately.

---

# 27. Phase 24 — Buyer Dashboard

Implement:

```text
BuyerHeader
CapacityKPI
BookedKPI
RemainingKPI
WaitingKPI
DemandSummary
IncomingLots
QueueSummary
TransactionSummary
```

The first screen must be operational rather than decorative.

---

# 28. Phase 25 — Buyer Demand Management

Build:

```text
Create Demand
Edit Demand
Pause Demand
Resume Demand
Fulfill Demand
Expire Demand
```

Changing demand must change farmer-side matching/recommendations.

---

# 29. Phase 26 — Buyer Queue Management

Build the queue screen using the supplied dense operational design direction.

Each item:

```text
Token
Crop
Quantity
Slot
Check-in
Status
ETA
```

Controls should be one-hand friendly.

---

# 30. Phase 27 — Buyer Inspection / Weighment / Offer

Build these as focused operational screens.

Sequence:

```text
Incoming Lot
 ↓
Inspection
 ↓
Weighment
 ↓
Offer
 ↓
Payment
```

Do not combine everything into one overloaded screen.

---

# 31. Phase 28 — Mapbox Integration

Implement:

- Market markers
- Farmer location
- Distance
- Route
- ETA

Use route data to drive the Leave Now calculation.

---

# 32. Phase 29 — Localization / Voice Foundation

Use:

```text
i18next
react-i18next
```

Create translation keys from the start.

Do not hardcode all user-facing strings inside components.

Prepare architecture for:

- Hindi
- English
- Additional Indian languages

Use Expo Audio + Sarvam AI where voice input/output is required.

---

# 33. Phase 30 — AI Assistant Foundation

If the existing KrishiNetra AI assistant architecture is reused, keep it as an independent service.

Possible pipeline:

```text
Voice/Text
 ↓
Gemini
 ↓
Intent
 ↓
Website/App navigation or domain action
 ↓
API
 ↓
Response
```

Do not let the AI directly mutate sensitive transaction state without explicit validated API actions.

---

# 34. Phase 31 — Realtime Testing

Test on two devices/emulators:

### Device A

Farmer

### Device B

Buyer

Run:

```text
Farmer creates lot
 ↓
Buyer receives lot
 ↓
Buyer accepts
 ↓
Farmer receives slot
 ↓
Buyer adds delay
 ↓
Farmer sees WAIT
 ↓
Buyer clears queue
 ↓
Farmer sees LEAVE NOW
 ↓
Farmer checks in
 ↓
Buyer inspects
 ↓
Buyer weighs
 ↓
Buyer offers
 ↓
Farmer accepts
 ↓
Buyer marks paid
 ↓
Farmer sees PAID
```

This is the primary acceptance test.

---

# 35. Phase 32 — Error / Edge Cases

Implement:

### Booking

- Slot unavailable
- Duplicate booking
- Cancellation
- Reschedule
- No-show

### Queue

- Counter closed
- Market paused
- Delay
- Queue clears faster
- Farmer arrives early
- Farmer arrives late

### Offer

- Rejected
- Clarification requested
- Offer expires

### Payment

- Pending
- Failed
- Retry
- Paid

---

# 36. Phase 33 — Loading / Empty / Error UI

Every screen must have:

```text
Loading
Empty
Error
Success
```

Use skeletons rather than blocking spinners where appropriate.

---

# 37. Phase 34 — Security Review

Before demo:

- Verify RLS.
- Verify role permissions.
- Verify farmer data isolation.
- Verify buyer data isolation.
- Remove service keys from client.
- Validate all backend input.
- Test unauthorized API calls.
- Verify private storage access.

---

# 38. Phase 35 — Performance Review

Check:

- Startup time
- Image upload size
- Realtime subscription count
- List pagination
- Navigation performance
- Map performance
- Large transaction lists
- Memory usage

---

# 39. Phase 36 — Testing

Run:

```text
Jest
React Native Testing Library
E2E test suite
```

Minimum tests:

### Recommendation

```text
Higher net realization ranks higher
```

### Queue

```text
Delay increases ETA
Completed lot decreases queue
Counter increase decreases ETA
```

### Booking

```text
Unavailable slot cannot be booked
```

### Permissions

```text
Farmer cannot modify buyer demand
Buyer cannot access another buyer's transaction
```

### Transaction

```text
Offer → Accepted → Paid → Complete
```

---

# 40. Phase 37 — Production Build

Use:

```text
Docker
Expo EAS
Supabase
```

Prepare:

- Development environment
- Staging environment
- Production environment

Never use production payment/secret credentials in development.

---

# 41. Recommended Implementation Order

Build in this exact dependency order:

```text
1. Project audit
2. Theme
3. Supabase schema
4. RLS
5. Seed data
6. Auth
7. Navigation
8. Shared components
9. Farmer dashboard
10. Buyer dashboard
11. Crop lot
12. Image upload
13. Quality service
14. Recommendation engine
15. Markets
16. Booking
17. Buyer incoming lots
18. Slot assignment
19. Token/QR
20. Realtime queue
21. WAIT/LEAVE NOW
22. Check-in
23. Inspection
24. Weighment
25. Offer
26. Offer acceptance
27. Payment
28. Receipt
29. Notifications
30. Localization
31. Maps
32. AI/voice integration
33. Edge cases
34. Tests
35. Security
36. Performance
37. EAS build
```

---

# 42. Definition of Done

The project is considered complete when:

## Farmer

- Can authenticate.
- Can create a crop lot.
- Can upload photos.
- Can receive quality estimate.
- Can see expected price.
- Can compare markets.
- Can see recommended market.
- Can book a slot.
- Receives token/QR.
- Receives realtime queue updates.
- Sees WAIT/GET READY/LEAVE NOW.
- Can check in.
- Can see final offer.
- Can accept offer.
- Can see payment.
- Can open receipt/history.

## Buyer

- Can authenticate.
- Can publish demand.
- Can see incoming lots.
- Can accept/reject lots.
- Can assign slots.
- Can manage queue.
- Can create delays.
- Can see farmer check-ins.
- Can perform physical inspection.
- Can record weighment.
- Can submit offer.
- Can update payment.
- Can see transactions.

## Cross-user

The complete workflow works between two authenticated devices without manual database editing.

---

# 43. Critical Demo Scenario

Use this exact demo:

```text
FARMER
Wheat — 20 QTL
        ↓
AI Quality
Grade A — 88/100
        ↓
Markets

A: ₹2,390 — High crowd
B: ₹2,500 — Low crowd ★
C: ₹2,560 — Medium crowd
        ↓
RECOMMEND B
Net ₹48,850
        ↓
REQUEST SLOT
        ↓
BUYER
Accepts lot
        ↓
Token MKT-B-142
3:30–4:00 PM
        ↓
BUYER
Adds 45 min delay
        ↓
FARMER
WAIT — Do not leave
        ↓
BUYER
Queue clears
        ↓
FARMER
LEAVE NOW
Travel 32 min
        ↓
CHECK-IN
        ↓
INSPECTION
AI A → Physical A
        ↓
WEIGHMENT
19.7 QTL
        ↓
OFFER
₹2,485/QTL
        ↓
FARMER ACCEPTS
        ↓
PAYMENT
₹48,654.50
        ↓
DIGITAL RECEIPT
```

This flow should be polished before adding secondary features.

---

# 44. Important Implementation Rules

1. Do not hardcode business data inside components.
2. Keep seed/mock data separate from production services.
3. Use typed API responses.
4. Use Zod at API boundaries.
5. Use RLS for database protection.
6. Use server-side validation for money and transaction state.
7. Keep AI grade separate from physical grade.
8. Never guarantee predicted prices.
9. Calculate recommendation using net realization, not price alone.
10. Persist every queue/status transition.
11. Use realtime events for operational state.
12. Make the app usable under weak network conditions.
13. Preserve the supplied Stitch visual language.
14. Keep farmer UI simple and buyer UI operationally dense.
15. Build reusable components instead of screen-specific duplicates.
16. Test the two-device workflow continuously during implementation.

---

# 45. Final Engineering Principle

The system should be designed around the transaction lifecycle:

```text
DISCOVER
 ↓
DECIDE
 ↓
BOOK
 ↓
WAIT / TRAVEL
 ↓
CHECK-IN
 ↓
VERIFY
 ↓
WEIGH
 ↓
OFFER
 ↓
ACCEPT
 ↓
PAY
 ↓
RECEIPT
```

Every step must have:

```text
Database State
+
API Action
+
Realtime Event
+
UI State
+
Audit Event
```

That is what makes the application genuinely dynamic rather than a collection of static screens.
