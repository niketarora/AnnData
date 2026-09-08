import {
  Profile,
  Farmer,
  Buyer,
  Market,
  Crop,
  CropLot,
  LotImage,
  BuyerDemand,
  Booking,
  QueueToken,
  Inspection,
  Weighment,
  Offer,
  Transaction,
  Payment,
  AppNotification,
  Grievance,
} from '../types/index.js';

export class MemoryDbStore {
  public profiles: Profile[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      user_id: '11111111-1111-1111-1111-111111111111',
      role: 'farmer',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@example.com',
      language: 'hi',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      user_id: '22222222-2222-2222-2222-222222222222',
      role: 'buyer',
      name: 'Anil Sharma',
      phone: '+91 98123 45678',
      email: 'anil.sharma@example.com',
      language: 'en',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public farmers: Farmer[] = [
    {
      id: 'f0000000-0000-0000-0000-000000000001',
      profile_id: '00000000-0000-0000-0000-000000000001',
      farm_location: 'Karnal Farm #3, Haryana',
      farm_size_acres: 8.5,
      preferred_radius_km: 45.0,
      vehicle_type: 'Tractor Trolley',
      vehicle_plate: 'HR-05-AB-4812',
      bank_account: {
        accountNumberMasked: '•••• •••• 8492',
        bankName: 'State Bank of India',
        ifsc: 'SBIN0001248',
        upiId: 'rajesh.krishi@oksbi',
        verified: true,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public buyers: Buyer[] = [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      profile_id: '00000000-0000-0000-0000-000000000002',
      organization_name: 'Kisan Agritech Mandi Consortium',
      market_name: 'Taraori APMC Mandi',
      mandi_gate: 'Gate 2 Express Line',
      counter_id: 'Counter 4',
      license_number: 'APMC-HAR-2024-8891',
      payment_reliability_score: 98.0,
      daily_capacity_quintals: 1000.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public markets: Market[] = [
    {
      id: '33333333-3333-3333-3333-333333333301',
      name: 'Taraori APMC Mandi',
      code: 'MKT-B-TARAORI',
      location: 'Taraori, GT Road',
      latitude: 29.8028,
      longitude: 76.9297,
      address: 'National Highway 44, Taraori',
      district: 'Karnal',
      state: 'Haryana',
      operating_hours: { open: '06:00', close: '18:00' },
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '33333333-3333-3333-3333-333333333302',
      name: 'Karnal Main APMC',
      code: 'MKT-A-KARNAL',
      location: 'Karnal City Center',
      latitude: 29.6857,
      longitude: 76.9905,
      address: 'Sector 12 New Grain Market',
      district: 'Karnal',
      state: 'Haryana',
      operating_hours: { open: '05:30', close: '19:00' },
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public crops: Crop[] = [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Wheat',
      variety: 'Sharbati',
      unit: 'Quintal',
      season: 'Rabi 2026',
      msp: 2275.0,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      name: 'Paddy',
      variety: 'Basmati 1121',
      unit: 'Quintal',
      season: 'Kharif 2026',
      msp: 3600.0,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public cropLots: CropLot[] = [
    {
      id: 'd0000000-0000-0000-0000-000000000098',
      farmer_id: 'f0000000-0000-0000-0000-000000000001',
      crop_id: 'c0000000-0000-0000-0000-000000000001',
      variety: 'Sharbati',
      quantity: 20.0,
      unit: 'Quintal',
      expected_harvest_date: new Date().toISOString().split('T')[0],
      quality_score: 88.0,
      preliminary_grade: 'Grade A',
      farm_location: 'Karnal Farm #3',
      status: 'BOOKED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public lotImages: LotImage[] = [
    {
      id: 'img-01',
      lot_id: 'd0000000-0000-0000-0000-000000000098',
      image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
      capture_type: 'TOP_OVERVIEW',
      created_at: new Date().toISOString(),
    },
  ];

  public demands: BuyerDemand[] = [
    {
      id: 'd1111111-1111-1111-1111-111111111111',
      buyer_id: 'b0000000-0000-0000-0000-000000000001',
      crop_id: 'c0000000-0000-0000-0000-000000000001',
      variety: 'Sharbati',
      minimum_grade: 'Grade A',
      quality_requirements: { maxMoisture: 12.0, minLuster: 85 },
      quantity_required: 500.0,
      quantity_fulfilled: 180.0,
      indicative_price_min: 2480.0,
      indicative_price_max: 2560.0,
      buying_date: new Date().toISOString().split('T')[0],
      daily_capacity: 1000.0,
      slot_duration_minutes: 30,
      processing_counters: 4,
      payment_terms: 'Instant DBT via Escrow',
      location: 'Taraori Gate 2',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public bookings: Booking[] = [
    {
      id: 'e0000000-0000-0000-0000-000000000142',
      lot_id: 'd0000000-0000-0000-0000-000000000098',
      buyer_id: 'b0000000-0000-0000-0000-000000000001',
      market_id: '33333333-3333-3333-3333-333333333301',
      scheduled_date: new Date().toISOString().split('T')[0],
      slot_start: '3:30 PM',
      slot_end: '4:00 PM',
      token: 'MKT-B-142',
      revised_processing_time: '3:30 PM',
      recommended_departure_time: '3:15 PM',
      departure_state: 'WAIT',
      travel_eta_minutes: 18,
      delay_minutes: 0,
      driver_name: 'Rajesh Kumar',
      vehicle_number: 'HR-05-AB-4812',
      status: 'SLOT_ASSIGNED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public queueTokens: QueueToken[] = [
    {
      id: 'tok-01',
      booking_id: 'e0000000-0000-0000-0000-000000000142',
      market_id: '33333333-3333-3333-3333-333333333301',
      token: 'MKT-B-142',
      scheduled_start: '3:30 PM',
      scheduled_end: '4:00 PM',
      sequence_number: 142,
      status: 'WAITING',
      issued_at: new Date().toISOString(),
    },
  ];

  public inspections: Inspection[] = [];
  public weighments: Weighment[] = [];
  public offers: Offer[] = [];
  public transactions: Transaction[] = [];
  public payments: Payment[] = [];
  public grievances: Grievance[] = [];

  public notifications: AppNotification[] = [
    {
      id: '90000000-0000-0000-0000-000000000001',
      user_id: '00000000-0000-0000-0000-000000000001',
      role: 'FARMER',
      category: 'QUEUE',
      title: 'Mandi Gate Congestion Alert',
      message: 'Taraori Mandi Gate 2 queue updated. Please monitor departure status before driving.',
      action_route: 'LiveMandiQueue',
      read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '90000000-0000-0000-0000-000000000002',
      user_id: '00000000-0000-0000-0000-000000000002',
      role: 'BUYER',
      category: 'QUEUE',
      title: 'New Booking Slot Reserved',
      message: 'Rajesh Kumar booked slot 3:30–4:00 PM for 20 QTL Sharbati Wheat (Token #MKT-B-142).',
      action_route: 'QueueControlPanel',
      read: false,
      created_at: new Date().toISOString(),
    },
  ];

  public auditLogs: Array<{
    id: string;
    actor: string;
    action: string;
    entity: string;
    entity_id: string;
    metadata: Record<string, unknown>;
    timestamp: string;
  }> = [];
}

export const memoryDb = new MemoryDbStore();
