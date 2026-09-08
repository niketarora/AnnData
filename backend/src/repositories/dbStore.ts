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
import {
  DataSource,
  DataIngestionRun,
  ExternalDataRecord,
  DataFreshness,
  ModelRegistryEntry,
  PredictionRun,
  PredictionInputSnapshot,
  Prediction,
  Recommendation,
  RecommendationFactor,
  DecisionEvent,
} from '../types/intelligence.types.js';

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

  // ==========================================
  // Phase 3 Intelligence Collections
  // ==========================================
  public dataSources: DataSource[] = [
    {
      id: 'src-01',
      name: 'Agmarknet Haryana APMC Wholesale Price Feed',
      type: 'mandi_prices',
      base_url: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
      active: true,
      refresh_interval_seconds: 900,
      last_success_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'src-02',
      name: 'Open-Meteo Agro-Meteorological Weather Feed',
      type: 'weather',
      base_url: 'https://api.open-meteo.com/v1/forecast',
      active: true,
      refresh_interval_seconds: 1800,
      last_success_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'src-03',
      name: 'Government Minimum Support Price (MSP) Gazette Floor',
      type: 'msp',
      base_url: 'https://agricoop.gov.in/msp',
      active: true,
      refresh_interval_seconds: 86400,
      last_success_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public dataIngestionRuns: DataIngestionRun[] = [
    {
      id: 'ingest-01',
      source_id: 'src-01',
      started_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
      completed_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: 'SUCCESS',
      records_received: 24,
      records_inserted: 18,
      records_updated: 6,
      records_rejected: 0,
      created_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    },
  ];

  public externalDataRecords: ExternalDataRecord[] = [];

  public dataFreshness: DataFreshness[] = [
    {
      id: 'fresh-01',
      entity_type: 'crop',
      entity_id: '55555555-5555-5555-5555-555555555501', // Wheat
      status: 'LIVE',
      last_observed_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      last_synced_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
      source_id: 'src-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'fresh-02',
      entity_type: 'market',
      entity_id: '33333333-3333-3333-3333-333333333301', // Taraori
      status: 'LIVE',
      last_observed_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      last_synced_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 55 * 60 * 1000).toISOString(),
      source_id: 'src-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  public modelRegistry: ModelRegistryEntry[] = [
    {
      id: 'mod-01',
      model_name: 'OASSM-10-PriceTransformer',
      version: '1.2.0',
      provider: 'OASSM-10',
      input_schema_version: '1.0.0',
      output_schema_version: '1.0.0',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mod-02',
      model_name: 'CatBoost-SellingDecisionEngine',
      version: '2.1.0',
      provider: 'CatBoost',
      input_schema_version: '1.0.0',
      output_schema_version: '1.0.0',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 'mod-03',
      model_name: 'Vision-GrainQualityClassifier',
      version: '1.0.4',
      provider: 'VisionClassifier',
      input_schema_version: '1.0.0',
      output_schema_version: '1.0.0',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
  ];

  public predictionRuns: PredictionRun[] = [];
  public predictionInputSnapshots: PredictionInputSnapshot[] = [];
  public predictions: Prediction[] = [];
  public recommendations: Recommendation[] = [];
  public recommendationFactors: RecommendationFactor[] = [];
  public decisionEvents: DecisionEvent[] = [];
}

export const memoryDb = new MemoryDbStore();
