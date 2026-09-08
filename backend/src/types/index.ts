export type UserRole = 'farmer' | 'buyer' | 'operator';

export type CropLotStatus =
  | 'DRAFT'
  | 'READY'
  | 'BOOKING_REQUESTED'
  | 'BOOKED'
  | 'GATE_CHECKED_IN'
  | 'PHYSICALLY_INSPECTED'
  | 'WEIGHED'
  | 'OFFER_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'PAID'
  | 'SOLD'
  | 'CANCELLED'
  | 'REJECTED';

export type DemandStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FULFILLED' | 'EXPIRED';

export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SLOT_ASSIGNED'
  | 'CHECKED_IN'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type QueueStatus =
  | 'WAITING'
  | 'CALLED'
  | 'CHECKED_IN'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED'
  | 'DELAYED';

export type DepartureState =
  | 'WAIT'
  | 'GET_READY'
  | 'LEAVE_NOW'
  | 'DELAYED'
  | 'EARLY'
  | 'ARRIVED';

export type OfferStatus = 'OFFERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'COUNTERED';

export type PaymentStatus =
  | 'PAYMENT_PENDING'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type GrievanceStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  name: string;
  phone?: string;
  email?: string;
  language?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Farmer {
  id: string;
  profile_id: string;
  farm_location?: string;
  farm_size_acres?: number;
  preferred_radius_km?: number;
  vehicle_type?: string;
  vehicle_plate?: string;
  bank_account?: {
    accountNumberMasked?: string;
    bankName?: string;
    ifsc?: string;
    upiId?: string;
    verified?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Buyer {
  id: string;
  profile_id: string;
  organization_name: string;
  market_name?: string;
  mandi_gate?: string;
  counter_id?: string;
  license_number?: string;
  payment_reliability_score: number;
  daily_capacity_quintals: number;
  created_at: string;
  updated_at: string;
}

export interface Market {
  id: string;
  name: string;
  code: string;
  location: string;
  latitude: number;
  longitude: number;
  address?: string;
  district?: string;
  state?: string;
  operating_hours?: {
    open: string;
    close: string;
  };
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  unit: string;
  season?: string;
  msp?: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CropLot {
  id: string;
  farmer_id: string;
  crop_id: string;
  variety?: string;
  quantity: number;
  unit: string;
  expected_harvest_date?: string;
  quality_score?: number;
  preliminary_grade?: string;
  farm_location?: string;
  status: CropLotStatus;
  created_at: string;
  updated_at: string;
}

export interface LotImage {
  id: string;
  lot_id: string;
  image_url: string;
  capture_type: string;
  created_at: string;
}

export interface BuyerDemand {
  id: string;
  buyer_id: string;
  crop_id: string;
  variety?: string;
  minimum_grade?: string;
  quality_requirements?: Record<string, unknown>;
  quantity_required: number;
  quantity_fulfilled: number;
  indicative_price_min: number;
  indicative_price_max: number;
  buying_date: string;
  daily_capacity?: number;
  slot_duration_minutes: number;
  processing_counters: number;
  payment_terms?: string;
  location?: string;
  special_requirements?: string;
  status: DemandStatus;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  lot_id: string;
  buyer_id: string;
  market_id: string;
  scheduled_date: string;
  slot_start: string;
  slot_end: string;
  token?: string;
  revised_processing_time?: string;
  recommended_departure_time?: string;
  departure_state: DepartureState;
  travel_eta_minutes: number;
  delay_minutes: number;
  driver_name?: string;
  vehicle_number?: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface QueueToken {
  id: string;
  booking_id: string;
  market_id: string;
  token: string;
  scheduled_start?: string;
  scheduled_end?: string;
  sequence_number?: number;
  status: QueueStatus;
  issued_at: string;
}

export interface Inspection {
  id: string;
  booking_id: string;
  lot_id: string;
  ai_grade?: string;
  physical_grade: string;
  quality_score: number;
  moisture?: number;
  defects?: number;
  foreign_matter?: number;
  notes?: string;
  verified_by?: string;
  verified_at: string;
  created_at: string;
}

export interface Weighment {
  id: string;
  booking_id: string;
  lot_id: string;
  expected_quantity: number;
  gross_weight?: number;
  tare_weight?: number;
  actual_quantity: number;
  unit: string;
  difference: number;
  verified_by?: string;
  verified_at: string;
  notes?: string;
  created_at: string;
}

export interface Offer {
  id: string;
  booking_id: string;
  buyer_id: string;
  farmer_id: string;
  lot_id: string;
  price_per_unit: number;
  quantity: number;
  gross_amount: number;
  freight_cost: number;
  mandi_cess: number;
  unloading_charges: number;
  other_deductions: number;
  net_amount: number;
  expires_at?: string;
  notes?: string;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  booking_id: string;
  offer_id: string;
  farmer_id: string;
  buyer_id: string;
  lot_id: string;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  payment_reference?: string;
  receipt_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  provider: string;
  provider_reference?: string;
  status: PaymentStatus;
  created_at: string;
  completed_at?: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  role: string;
  category: string;
  title: string;
  message: string;
  action_route?: string;
  read: boolean;
  created_at: string;
}

export interface Grievance {
  id: string;
  user_id: string;
  booking_id?: string;
  transaction_id?: string;
  type: string;
  description: string;
  attachments?: unknown[];
  status: GrievanceStatus;
  created_by?: string;
  assigned_to?: string;
  resolution?: string;
  created_at: string;
  resolved_at?: string;
}

export interface AuthContext {
  userId: string;
  profileId: string;
  role: UserRole;
  farmerId?: string;
  buyerId?: string;
  token?: string;
}
