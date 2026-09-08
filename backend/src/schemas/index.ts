import { z } from 'zod';

// Common Schemas
export const uuidSchema = z.string().uuid({ message: 'Invalid UUID format' });

export const paginationSchema = z.object({
  page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(100, Math.max(1, parseInt(v, 10))) : 20)),
});

// Auth & Profiles
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(15).optional(),
  language: z.enum(['en', 'hi', 'pa']).optional(),
  avatar_url: z.string().url().optional(),
});

// Farmer Profile
export const updateFarmerSchema = z.object({
  farm_location: z.string().min(3).max(200).optional(),
  farm_size_acres: z.number().positive().optional(),
  preferred_radius_km: z.number().positive().optional(),
  vehicle_type: z.string().optional(),
  vehicle_plate: z.string().optional(),
  bank_account: z
    .object({
      accountNumberMasked: z.string().optional(),
      bankName: z.string().optional(),
      ifsc: z.string().optional(),
      upiId: z.string().optional(),
      verified: z.boolean().optional(),
    })
    .optional(),
});

// Buyer Profile
export const updateBuyerSchema = z.object({
  organization_name: z.string().min(2).max(200).optional(),
  market_name: z.string().optional(),
  mandi_gate: z.string().optional(),
  counter_id: z.string().optional(),
  license_number: z.string().optional(),
  daily_capacity_quintals: z.number().positive().optional(),
});

// Crop Lots
export const createCropLotSchema = z.object({
  crop_id: z.string().min(1),
  variety: z.string().min(2).max(100),
  quantity: z.number().positive({ message: 'Quantity must be greater than 0' }),
  unit: z.string().default('Quintal'),
  expected_harvest_date: z.string().optional(),
  quality_score: z.number().min(0).max(100).optional(),
  preliminary_grade: z.string().optional(),
  farm_location: z.string().min(2).max(200),
  images: z.array(z.string().url()).optional(),
});

export const updateCropLotSchema = z.object({
  variety: z.string().min(2).max(100).optional(),
  quantity: z.number().positive().optional(),
  expected_harvest_date: z.string().optional(),
  farm_location: z.string().optional(),
  status: z
    .enum([
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
      'REJECTED',
    ])
    .optional(),
});

export const addLotImagesSchema = z.object({
  images: z.array(
    z.object({
      image_url: z.string().url(),
      capture_type: z.string().default('STANDARD'),
    })
  ).min(1, { message: 'At least one image is required' }),
});

// Buyer Demands
export const createBuyerDemandSchema = z.object({
  crop_id: z.string().min(1),
  variety: z.string().min(2).max(100),
  minimum_grade: z.string().default('Grade B'),
  quality_requirements: z.record(z.unknown()).optional(),
  quantity_required: z.number().positive(),
  indicative_price_min: z.number().positive(),
  indicative_price_max: z.number().positive(),
  buying_date: z.string(),
  daily_capacity: z.number().positive().optional(),
  slot_duration_minutes: z.number().int().positive().default(30),
  processing_counters: z.number().int().positive().default(4),
  payment_terms: z.string().default('DBT within 24h'),
  location: z.string().optional(),
  special_requirements: z.string().optional(),
});

export const updateBuyerDemandSchema = z.object({
  quantity_required: z.number().positive().optional(),
  indicative_price_min: z.number().positive().optional(),
  indicative_price_max: z.number().positive().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'FULFILLED', 'EXPIRED']).optional(),
});

// Bookings
export const createBookingSchema = z.object({
  lot_id: z.string().min(1),
  buyer_id: z.string().min(1),
  market_id: z.string().min(1),
  scheduled_date: z.string(),
  slot_start: z.string(),
  slot_end: z.string(),
  driver_name: z.string().optional(),
  vehicle_number: z.string().optional(),
});

export const assignSlotSchema = z.object({
  slot_start: z.string().min(1),
  slot_end: z.string().min(1),
  market_code: z.string().default('MKT-B'),
});

export const cancelBookingSchema = z.object({
  reason: z.string().min(3).max(500),
});

// Queue
export const queueDelaySchema = z.object({
  minutes: z.number().int().min(1).max(180, { message: 'Delay cannot exceed 180 minutes' }),
  reason: z.string().optional(),
});

export const updateDepartureStateSchema = z.object({
  departure_state: z.enum(['WAIT', 'GET_READY', 'LEAVE_NOW', 'DELAYED', 'EARLY', 'ARRIVED']),
});

// Inspection
export const createInspectionSchema = z.object({
  booking_id: z.string().min(1),
  lot_id: z.string().min(1),
  ai_grade: z.string().optional(),
  physical_grade: z.string().min(1),
  quality_score: z.number().min(0).max(100),
  moisture: z.number().min(0).max(100).optional(),
  defects: z.number().min(0).max(100).optional(),
  foreign_matter: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
});

// Weighment
export const createWeighmentSchema = z.object({
  booking_id: z.string().min(1),
  lot_id: z.string().min(1),
  expected_quantity: z.number().positive(),
  gross_weight: z.number().positive().optional(),
  tare_weight: z.number().nonnegative().optional(),
  actual_quantity: z.number().positive(),
  unit: z.string().default('Quintal'),
  notes: z.string().max(1000).optional(),
});

// Offers
export const createOfferSchema = z.object({
  booking_id: z.string().min(1),
  lot_id: z.string().min(1),
  price_per_unit: z.number().positive(),
  quantity: z.number().positive(),
  freight_cost: z.number().nonnegative().default(0),
  mandi_cess: z.number().nonnegative().default(0),
  unloading_charges: z.number().nonnegative().default(0),
  other_deductions: z.number().nonnegative().default(0),
  notes: z.string().max(1000).optional(),
  expires_in_hours: z.number().int().positive().default(24),
});

export const counterOfferSchema = z.object({
  counter_price_per_unit: z.number().positive(),
  notes: z.string().max(500).optional(),
});

// Payments
export const releasePaymentSchema = z.object({
  payment_method: z.string().default('DBT_ESCROW'),
  transaction_reference: z.string().optional(),
});

// Grievances
export const createGrievanceSchema = z.object({
  booking_id: z.string().optional(),
  transaction_id: z.string().optional(),
  type: z.enum(['INSPECTION', 'WEIGHMENT', 'OFFER', 'PAYMENT', 'QUEUE', 'OTHER']),
  description: z.string().min(10).max(2000),
  attachments: z.array(z.string().url()).optional(),
});

export const resolveGrievanceSchema = z.object({
  resolution: z.string().min(5).max(2000),
  status: z.enum(['RESOLVED', 'REJECTED']),
});
