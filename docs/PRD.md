# PRD — AgriFintech Operating System

## 1. Document Purpose

This PRD defines the complete product requirements for the AgriFintech mobile application based on:

1. The supplied product specification for farmer/seller + buyer/mandi workflows.
2. The supplied Stitch design package and `DESIGN.md`.
3. The requested KrishiNetra 2.0 technology stack.

The goal is to build the complete cross-user workflow in one implementation cycle, while keeping the application data-driven and realtime.

---

# 2. Product Vision

Build a two-sided agricultural fintech marketplace that helps farmers make better selling decisions and helps buyers/mandi operators manage demand, capacity, queue, crop verification, offers and payments.

### Core product statement

> **Convert market information into a selling decision, then help both sides execute that decision end-to-end.**

The farmer experience answers:

> **What should I sell, where should I sell it, when should I leave, and how much will I actually receive?**

The buyer experience answers:

> **What demand do I have, which farmer lots should I accept, how should I allocate capacity, what is the current queue, and which transactions need action?**

---

# 3. Personas

## 3.1 Farmer / Seller

Needs:

- Simple mobile UI
- Minimal typing
- Crop/lot registration
- Preliminary AI quality estimate
- Expected price range
- Market/buyer comparison
- Net realization calculation
- Booking/token
- Live queue
- Wait/Leave Now guidance
- Final offer
- Payment tracking
- Receipt/history
- Notifications

## 3.2 Buyer / Mandi Operator

Needs:

- Demand creation
- Incoming lot management
- Quality/lot matching
- Capacity management
- Slot assignment
- Queue management
- Delay controls
- Physical inspection
- Weighment
- Final offer
- Payment management
- Transaction history
- Notifications

---

# 4. Product Scope

## MVP In Scope

### Farmer

1. Authentication
2. Farmer dashboard
3. Create crop lot
4. Crop image upload/camera
5. AI/preliminary quality result
6. Expected price range
7. Market recommendation
8. Market comparison
9. Market details
10. Slot request
11. Booking confirmation
12. Token/QR
13. Live queue
14. WAIT / GET READY / LEAVE NOW / DELAYED states
15. Check-in
16. Physical verification result
17. Final offer
18. Offer acceptance/rejection
19. Payment status
20. Digital receipt
21. Sales history
22. Notifications
23. Profile

### Buyer

1. Buyer authentication
2. Buyer dashboard
3. Demand creation
4. Demand list
5. Incoming farmer lots
6. Lot detail
7. Accept/reject/request inspection
8. Slot assignment
9. Token generation
10. Live queue
11. Delay/queue controls
12. Check-in visibility
13. Physical inspection
14. Weighment
15. Final offer
16. Payment status
17. Transactions
18. Notifications
19. Profile

---

# 5. Product Workflow

```text
FARMER
Create Lot
    ↓
Upload Crop Images
    ↓
Quality Assessment
    ↓
Expected Price Range
    ↓
Compare Markets / Buyers
    ↓
Net Realization Recommendation
    ↓
Request Slot
    ↓
BUYER
Review Incoming Lot
    ↓
Accept
    ↓
Assign Slot
    ↓
Generate Token
    ↓
FARMER
Receive Token
    ↓
Monitor Queue
    ↓
WAIT / GET READY / LEAVE NOW
    ↓
Travel
    ↓
QR / Token Check-in
    ↓
BUYER
Physical Quality Verification
    ↓
Weighment
    ↓
Final Offer
    ↓
FARMER
Accept / Reject
    ↓
Payment
    ↓
Digital Receipt
```

---

# 6. Farmer Dashboard Requirements

The dashboard is decision-first.

It must immediately expose:

- Active crop
- Estimated value
- Best current selling option
- Booking state
- Live queue state
- Financial summary
- Important notifications

## Primary dashboard card

The highest-priority card should dynamically communicate one of:

- SELL NOW
- WAIT
- PARTIAL SELL
- NO STRONG OPPORTUNITY

Never guarantee a future price.

---

# 7. Farmer Selling Decision

## Inputs

- Crop
- Variety
- Quantity
- Quality estimate
- Expected price
- Buyer demand
- Market price
- Distance
- Travel time
- Transport cost
- Loading/unloading cost
- Waiting cost
- Queue length
- Average processing time
- Active counters
- Slots remaining
- Buyer reliability
- Payment terms
- Price confidence
- Historical trend where available

## Net Realization

```text
Gross Revenue = Expected Price × Quantity

Net Realization =
Gross Revenue
- Transport Cost
- Loading/Unloading Cost
- Estimated Waiting Cost
- Other Transaction Costs
```

## Recommendation Score

Initial configurable prototype formula:

```text
Market Score =
0.30 × Net Price Score
+ 0.20 × Demand Score
+ 0.15 × Distance Score
+ 0.15 × Queue Score
+ 0.10 × Buyer Reliability Score
+ 0.10 × Price Confidence Score
```

Weights must be configurable.

---

# 8. Booking Requirements

Booking lifecycle:

```text
REQUESTED
→ ACCEPTED
→ SLOT_ASSIGNED
→ WAIT
→ LEAVE_NOW
→ ARRIVING
→ CHECKED_IN
→ INSPECTION
→ SALE
→ PAYMENT
→ COMPLETE
```

Alternative states:

```text
REJECTED
RESCHEDULED
CANCELLED
NO_SHOW
DISPUTED
```

Every transition must be timestamped.

---

# 9. Queue Requirements

The queue is a first-class product feature.

Inputs:

- Farmers checked in
- Lots currently processing
- Rolling processing time
- Active counters
- Delayed lots
- Cancellations/no-shows
- Current queue
- Farmer ETA
- Slot
- Market operational status

Initial queue estimate:

```text
Estimated Processing Delay =
Lots Ahead × Rolling Average Processing Time / Active Counters
```

Departure:

```text
Recommended Departure =
Updated Processing Time
- Travel ETA
- Safety Buffer
```

The queue state must update when buyer/operator changes queue conditions.

---

# 10. Buyer Dashboard Requirements

Buyer dashboard is operations-first.

Must show:

- Today's capacity
- Booked quantity
- Remaining capacity
- Farmers waiting
- Lots processed
- Average processing time
- Current delay
- Total purchased quantity
- Active demand
- Incoming lots requiring action

---

# 11. Buyer Demand

Buyer can define:

- Crop
- Variety
- Minimum grade
- Quality parameters
- Required quantity
- Indicative price/range
- Buying date(s)
- Daily capacity
- Processing counters
- Payment terms
- Location
- Slot duration
- Special requirements

Demand statuses:

```text
DRAFT
ACTIVE
PAUSED
FULFILLED
EXPIRED
```

Changing demand/capacity must affect farmer recommendations dynamically.

---

# 12. Lot Acceptance

Buyer sees:

- Lot ID
- Crop/variety
- Quantity
- AI predicted grade
- Confidence
- Images
- Farmer distance
- Proposed arrival
- Demand match

Actions:

- Accept
- Reject
- Request more photos
- Request inspection
- Assign slot

Accepting a lot must:

1. Reserve capacity.
2. Generate/prepare booking.
3. Assign slot.
4. Generate token.
5. Notify farmer.
6. Add lot to queue forecast.

---

# 13. Physical Verification

AI grade is preliminary.

The final market grade is independently recorded after physical inspection.

Show:

```text
AI Pre-Grade: A
Physical Grade: A
```

If they differ, preserve both values for auditability.

---

# 14. Transaction Requirements

Transaction lifecycle:

```text
OFFERED
→ ACCEPTED
→ WEIGHED
→ INVOICED
→ PAYMENT_PENDING
→ PAID
→ COMPLETE
```

Store:

- Lot
- Farmer
- Buyer
- Quantity
- Final grade
- Rate
- Gross
- Deductions
- Net amount
- Payment mode
- Payment reference
- Timestamps

---

# 15. Notifications

## Farmer

- Quality ready
- Better selling opportunity
- Slot accepted/rejected
- Slot assigned/rescheduled
- Market delay
- Wait
- Get Ready
- Leave Now
- Queue moving faster
- Check-in reminder
- Offer received
- Payment initiated
- Payment completed

## Buyer

- New lot
- High-quality matching lot
- Farmer accepted slot
- Farmer approaching
- Farmer checked in
- Queue delay threshold
- Demand nearly fulfilled

---

# 16. Non-Functional Product Requirements

## Reliability

Critical booking, queue and transaction transitions must be persisted.

## Realtime

Queue, booking status, demand availability and transaction status should update without manual refresh.

## Security

- Role-based access
- RLS
- Private farmer data
- Authenticated buyer/operator accounts
- No public phone/address exposure

## Usability

- 48px minimum touch target
- Large currency display
- Clear status labels
- Farmer-friendly terminology
- Minimal typing
- Local-language ready

## Auditability

Record:

- Status changes
- Queue events
- Inspection changes
- Weighment
- Offers
- Payment state
- Timestamps

---

# 17. Acceptance Criteria

The MVP is successful when two logged-in users can demonstrate:

```text
Farmer creates lot
→ Quality result appears
→ Recommendations show
→ Farmer selects market
→ Requests slot
→ Buyer sees request
→ Buyer accepts
→ Buyer assigns slot
→ Farmer receives token
→ Buyer changes queue
→ Farmer changes to WAIT
→ Buyer clears queue
→ Farmer changes to LEAVE NOW
→ Farmer checks in
→ Buyer records physical grade
→ Buyer records weight
→ Buyer submits offer
→ Farmer accepts
→ Payment becomes PAID
→ Farmer sees receipt
```

No manual database edits should be required during the primary demo flow.
