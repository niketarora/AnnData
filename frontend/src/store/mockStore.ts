import {
  UserRole,
  FarmerProfile,
  BuyerProfile,
  CropLot,
  Market,
  MarketDemand,
  Recommendation,
  Booking,
  LiveQueueState,
  DepartureState,
  PhysicalInspection,
  WeighmentRecord,
  BuyerOffer,
  Transaction,
  AppNotification,
} from '../types';
import type { FarmerLanguage } from '../i18n/farmerCopy';

export interface AppState {
  currentRole: UserRole;
  language: FarmerLanguage;
  farmer: FarmerProfile;
  buyer: BuyerProfile;
  lots: CropLot[];
  activeLotId: string;
  markets: Market[];
  recommendation: Recommendation;
  bookings: Booking[];
  activeBookingId: string;
  queue: LiveQueueState;
  inspections: Record<string, PhysicalInspection>;
  weighments: Record<string, WeighmentRecord>;
  offers: Record<string, BuyerOffer>;
  activeOfferId: string;
  transactions: Transaction[];
  activeTransactionId: string;
  demands: MarketDemand[];
  notifications: AppNotification[];
}

// Deterministic seed data matching PRD, TRD, and Stitch designs
const initialFarmer: FarmerProfile = {
  id: 'farmer-rajesh-01',
  name: 'Rajesh Kumar',
  phone: '+91 98765 43210',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  location: 'Karnal, Haryana',
  mandiRegion: 'Karnal Mandi Region',
  farmSizeAcres: 8.5,
  vehicleType: 'Tractor Trolley',
  vehiclePlate: 'HR-05-AB-4812',
  bankAccount: {
    accountNumberMasked: '•••• •••• 8492',
    bankName: 'State Bank of India',
    ifsc: 'SBIN0001248',
    upiId: 'rajesh.krishi@oksbi',
    verified: true,
  },
  preferredMarkets: ['mkt-b-taraori', 'mkt-a-karnal'],
};

const initialBuyer: BuyerProfile = {
  id: 'buyer-anil-01',
  name: 'Anil Sharma',
  phone: '+91 98123 45678',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  organizationName: 'Kisan Agritech Mandi Consortium',
  marketName: 'Taraori APMC Mandi',
  mandiGate: 'Gate 2 Express Line',
  counterId: 'Counter 4',
  licenseNumber: 'APMC-HAR-2024-8891',
  paymentReliabilityScore: 98,
  dailyCapacityQuintals: 1000,
};

const initialLots: CropLot[] = [
  {
    id: 'lot-wh-098',
    farmerId: 'farmer-rajesh-01',
    farmerName: 'Rajesh Kumar',
    crop: 'Wheat',
    variety: 'Sharbati',
    quantityQuintals: 20,
    harvestDate: '2026-09-02',
    farmLocation: 'Karnal Farm #3',
    status: 'BOOKING_CONFIRMED',
    createdAt: '2026-09-04',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
      'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
      'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600',
    ],
    qualityAssessment: {
      id: 'qa-098',
      overallScore: 88,
      predictedGrade: 'Grade A',
      confidenceScore: 91,
      tierLabel: 'Top Quality Tier',
      varietyBenchmark: 'Sharbati Gold Premium',
      minEstimatedPrice: 2420,
      maxEstimatedPrice: 2520,
      assessedAt: '2 mins ago',
      modelVersion: 'v3.4 Agmarknet Verified',
      isPreliminary: true,
      factors: [
        {
          name: 'Grain Uniformity',
          description: 'Excellent grain size consistency',
          value: '94%',
          percent: 94,
          status: 'success',
          icon: 'grain',
        },
        {
          name: 'Moisture Content',
          description: 'Optimal benchmark < 12.0%',
          value: '11.8%',
          percent: 78,
          status: 'info',
          icon: 'water_drop',
        },
        {
          name: 'Foreign Matter / Admixture',
          description: 'Very low dust, husk & stones',
          value: '0.8%',
          percent: 16,
          status: 'success',
          icon: 'filter_alt',
        },
        {
          name: 'Visible Damage',
          description: 'Minimal shriveled or broken grains',
          value: '1.2%',
          percent: 24,
          status: 'warning',
          icon: 'broken_image',
        },
        {
          name: 'Appearance & Lustre',
          description: 'Golden amber sheen, healthy kernel',
          value: '90%',
          percent: 90,
          status: 'success',
          icon: 'light_mode',
        },
      ],
      photos: [
        {
          id: 'p1',
          url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
          title: 'Tray View #1',
          detectedFeatures: '92 Grains detected',
          confidencePercent: 99,
          highlightTag: '99% Pure',
          tagColor: 'success',
        },
        {
          id: 'p2',
          url: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600',
          title: 'Macro Core #2',
          detectedFeatures: 'Zero Foreign Matter',
          confidencePercent: 94,
          highlightTag: 'Uniform',
          tagColor: 'success',
        },
        {
          id: 'p3',
          url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
          title: 'Spread Sample #3',
          detectedFeatures: 'Minor Broken (0.4%)',
          confidencePercent: 89,
          highlightTag: '0.4% chip',
          tagColor: 'warning',
        },
        {
          id: 'p4',
          url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600',
          title: 'Lustre Angle #4',
          detectedFeatures: '94% Lustre Sheen',
          confidencePercent: 95,
          highlightTag: 'Golden Sheen',
          tagColor: 'success',
        },
      ],
    },
  },
  {
    id: 'lot-pd-042',
    farmerId: 'farmer-rajesh-01',
    farmerName: 'Rajesh Kumar',
    crop: 'Paddy',
    variety: 'Basmati 1121',
    quantityQuintals: 35,
    harvestDate: '2026-09-06',
    farmLocation: 'Karnal Farm #1',
    status: 'AI_GRADED',
    createdAt: '2026-09-07',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600'],
  },
];

const initialMarkets: Market[] = [
  {
    id: 'mkt-b-taraori',
    name: 'Taraori APMC Mandi (Market B)',
    location: 'Taraori, NH-44',
    distanceKm: 20,
    transitMinutes: 35,
    grossPricePerQuintal: 2500,
    expectedNetPayout: 48850,
    netRatePerQuintal: 2442.5,
    transportCost: 750,
    mandiCessDeduction: 400,
    gateWaitingMinutes: 25,
    queueCongestion: 'Low',
    openDemandQuintals: 500,
    dailySlotsRemaining: 6,
    isRecommended: true,
    recommendationReason: 'Highest net payout with shortest gate queue today.',
    operatingHours: '08:00 AM – 06:00 PM',
    facilities: [
      { name: 'Electronic Weighbridge', available: true, icon: 'scale' },
      { name: 'Automated Grain Moisture Lab', available: true, icon: 'science' },
      { name: 'Covered Sheds', available: true, icon: 'roofing' },
      { name: 'Direct Bank Settlement Counter', available: true, icon: 'payments' },
    ],
  },
  {
    id: 'mkt-a-karnal',
    name: 'Karnal Central Mandi (Market A)',
    location: 'Karnal Central, Sector 12',
    distanceKm: 10,
    transitMinutes: 20,
    grossPricePerQuintal: 2390,
    expectedNetPayout: 46900,
    netRatePerQuintal: 2345.0,
    transportCost: 400,
    mandiCessDeduction: 500,
    gateWaitingMinutes: 80,
    queueCongestion: 'High',
    openDemandQuintals: 300,
    dailySlotsRemaining: 2,
    isRecommended: false,
    recommendationReason: 'Severe gate congestion with 80+ min estimated wait.',
    operatingHours: '07:30 AM – 07:00 PM',
    facilities: [
      { name: 'Manual Weighbridge', available: true, icon: 'scale' },
      { name: 'Covered Sheds', available: true, icon: 'roofing' },
    ],
  },
  {
    id: 'mkt-c-gharaunda',
    name: 'Gharaunda Private Yard (Market C)',
    location: 'Gharaunda Bypass',
    distanceKm: 30,
    transitMinutes: 50,
    grossPricePerQuintal: 2560,
    expectedNetPayout: 48400,
    netRatePerQuintal: 2420.0,
    transportCost: 1650,
    mandiCessDeduction: 350,
    gateWaitingMinutes: 45,
    queueCongestion: 'Moderate',
    openDemandQuintals: 450,
    dailySlotsRemaining: 4,
    isRecommended: false,
    recommendationReason: 'High gross rate offset by ₹1,650 transport penalty for 30 km distance.',
    operatingHours: '08:30 AM – 05:30 PM',
    facilities: [
      { name: 'Digital Weighbridge', available: true, icon: 'scale' },
      { name: 'Grain Drying Floor', available: true, icon: 'wb_sunny' },
    ],
  },
];

const initialRecommendation: Recommendation = {
  action: 'PARTIAL_SELL',
  actionTitle: 'PARTIAL SELL',
  actionSubtitle: 'Sell 40% now • Hold 60% for 4–7 days',
  recommendedMarketId: 'mkt-b-taraori',
  recommendedMarketName: 'Taraori APMC Mandi (Market B)',
  expectedRealization: 48850,
  marketPriceRange: '₹2,450 – ₹2,620 / QTL',
  sevenDayTrendPercent: 4.8,
  sellPercent: 40,
  holdPercent: 60,
  rationale:
    'Market B gives the highest net payout after factoring ₹750 transport cost. Mandi prices are firm (+4.8% trend), so selling 40% secures immediate liquidity while retaining upside.',
};

const initialBookings: Booking[] = [
  {
    id: 'booking-b142',
    tokenNumber: 'MKT-B-142',
    lotId: 'lot-wh-098',
    farmerId: 'farmer-rajesh-01',
    farmerName: 'Rajesh Kumar',
    marketId: 'mkt-b-taraori',
    marketName: 'Taraori APMC Mandi',
    destinationMandi: 'Taraori Mandi Gate 2',
    scheduledSlot: '3:30 – 4:00 PM',
    adjustedSlot: '4:15 PM Adjusted',
    date: 'Today, 08 Sep 2026',
    vehicleNumber: 'HR-05-AB-4812 (Tractor Trolley)',
    driverName: 'Rajesh Kumar',
    assignedGate: 'Gate 2 Express Line',
    status: 'CONFIRMED',
    createdAt: '2026-09-08 09:30 AM',
  },
];

const initialQueue: LiveQueueState = {
  tokenNumber: 'MKT-B-142',
  currentServingToken: 'MKT-B-137',
  lotsAhead: 5,
  totalQueueLoad: 12,
  estimatedWeighmentTime: '04:15 PM',
  avgLotClearMinutes: 7.5,
  departureState: 'WAIT',
  delayMinutes: 45,
  revisedDepartureTime: '3:15 PM',
  gateNotice: {
    time: '3:12 PM',
    message: 'Intake counter 2 temporarily clearing moisture backlog. Queue speed expected to resume in 15 mins.',
  },
  activeCounter: 'Counter 4',
  lastUpdated: '12s ago',
  journeySteps: [
    { stepNumber: 1, label: 'Issued', sublabel: 'Token Confirmed', icon: 'check', status: 'completed' },
    { stepNumber: 2, label: 'Wait Farm', sublabel: 'Rest at Shed', icon: 'hourglass_top', status: 'current' },
    { stepNumber: 3, label: 'Transit', sublabel: 'On Route', icon: 'local_shipping', status: 'upcoming' },
    { stepNumber: 4, label: 'Gate In', sublabel: 'QR Check-in', icon: 'how_to_reg', status: 'upcoming' },
    { stepNumber: 5, label: 'Weighment', sublabel: 'Scale Slip', icon: 'scale', status: 'upcoming' },
    { stepNumber: 6, label: 'Paid', sublabel: 'Bank Credit', icon: 'payments', status: 'upcoming' },
  ],
};

const initialInspections: Record<string, PhysicalInspection> = {
  'booking-b142': {
    id: 'insp-001',
    bookingId: 'booking-b142',
    lotId: 'lot-wh-098',
    aiPreGrade: 'Grade A',
    physicalGrade: 'Grade A',
    moisturePercent: 11.8,
    admixturePercent: 0.8,
    damagedGrainPercent: 1.2,
    checklists: [
      { label: 'Insect infestation free', passed: true },
      { label: 'Color standard integrity', passed: true },
      { label: 'Odor & fungus check', passed: true },
      { label: 'Foreign matter under 1%', passed: true },
    ],
    inspectorNotes: 'Clean, mature golden Sharbati grains. Meets Premium Grade A APMC standard.',
    inspectedBy: 'Ramesh Verma (Mandi Quality Inspector #14)',
    inspectedAt: '03:45 PM',
    status: 'PASSED',
  },
};

const initialWeighments: Record<string, WeighmentRecord> = {
  'booking-b142': {
    id: 'wm-001',
    bookingId: 'booking-b142',
    lotId: 'lot-wh-098',
    expectedQuantityKg: 2000,
    grossWeightKg: 5420,
    tareWeightKg: 3450,
    netWeightKg: 1970,
    netQuintals: 19.70,
    scaleCalibrationVerified: true,
    scaleOperator: 'Dharam Pal (Scale #2 Operator)',
    weighedAt: '04:05 PM',
    scaleSlipNumber: 'WB-TAR-2026-9041',
  },
};

const initialOffers: Record<string, BuyerOffer> = {
  'booking-b142': {
    id: 'offer-001',
    bookingId: 'booking-b142',
    lotId: 'lot-wh-098',
    buyerId: 'buyer-anil-01',
    buyerName: 'Anil Sharma (Kisan Agritech Consortium)',
    cropVariety: 'Wheat (Sharbati Gold)',
    quantityQuintals: 19.70,
    finalGrade: 'Grade A',
    ratePerQuintal: 2485,
    grossAmount: 48954.50,
    deductions: {
      mandiCess: 300,
      unloadingFee: 0,
      qualityAdjustment: 0,
    },
    totalDeductions: 300,
    netPayout: 48654.50,
    paymentMode: 'Instant UPI',
    expiryMinutes: 15,
    status: 'PENDING',
    createdAt: '04:12 PM',
  },
};

const initialTransactions: Transaction[] = [
  {
    id: 'txn-28491',
    bookingId: 'booking-b142',
    offerId: 'offer-001',
    farmerId: 'farmer-rajesh-01',
    farmerName: 'Rajesh Kumar',
    buyerId: 'buyer-anil-01',
    buyerName: 'Anil Sharma',
    crop: 'Wheat (Sharbati)',
    quantityQuintals: 19.70,
    netAmount: 48654.50,
    paymentStatus: 'PENDING',
    paymentMode: 'Instant UPI (SBI A/C ••8492)',
    bankReference: 'UPI-CR-20260908-98124',
    createdAt: 'Today, 04:15 PM',
    receipt: {
      receiptNumber: 'J-FORM #HAR-TAR-2026-4819',
      transactionId: 'TXN-28491',
      date: '08 Sep 2026',
      farmerName: 'Rajesh Kumar',
      buyerName: 'Anil Sharma (Consortium)',
      marketName: 'Taraori APMC Mandi',
      cropName: 'Wheat',
      variety: 'Sharbati Gold',
      finalWeightQuintals: 19.70,
      grade: 'Grade A',
      ratePerQuintal: 2485,
      grossAmount: 48954.50,
      mandiFee: 300,
      netPaidAmount: 48654.50,
      paymentMode: 'Direct Bank Settlement (UPI)',
      bankRefNumber: 'UPI-CR-20260908-98124',
      status: 'PAID',
    },
  },
];

const initialDemands: MarketDemand[] = [
  {
    id: 'dem-01',
    buyerId: 'buyer-anil-01',
    buyerName: 'Anil Sharma',
    mandiName: 'Taraori APMC Mandi',
    crop: 'Wheat',
    variety: 'Sharbati',
    minimumGrade: 'Grade A',
    requiredQuantityQuintals: 500,
    fulfilledQuantityQuintals: 340,
    minPrice: 2450,
    maxPrice: 2550,
    targetDate: 'Today',
    dailyCapacity: 1000,
    assignedCounter: 'Counter 4',
    paymentTerms: 'Instant UPI on Weighment',
    status: 'ACTIVE',
  },
  {
    id: 'dem-02',
    buyerId: 'buyer-anil-01',
    buyerName: 'Anil Sharma',
    mandiName: 'Taraori APMC Mandi',
    crop: 'Tomato',
    variety: 'Hybrid F1',
    minimumGrade: 'Grade A/B',
    requiredQuantityQuintals: 200,
    fulfilledQuantityQuintals: 85,
    minPrice: 2400,
    maxPrice: 2600,
    targetDate: 'Today',
    dailyCapacity: 500,
    assignedCounter: 'Counter 2',
    paymentTerms: 'Direct Account Credit',
    status: 'ACTIVE',
  },
];

const initialNotifications: AppNotification[] = [
  {
    id: 'notif-01',
    recipientRole: 'FARMER',
    category: 'QUEUE',
    title: 'Mandi Gate Delay Alert',
    message: 'Taraori Mandi unloading is delayed by ~45 min. Please WAIT at farm shed. Departure ETA: 3:15 PM.',
    timestamp: '15m ago',
    read: false,
    actionRoute: 'LiveMandiQueue',
    badge: 'WAIT',
  },
  {
    id: 'notif-02',
    recipientRole: 'FARMER',
    category: 'MARKET',
    title: 'Higher Net Realization at Market B',
    message: 'Taraori Mandi price is ₹2,500/QTL with ₹48,850 expected net payout (+₹1,450 vs avg).',
    timestamp: '1h ago',
    read: true,
    actionRoute: 'BestPlacesToSell',
  },
  {
    id: 'notif-03',
    recipientRole: 'BUYER',
    category: 'QUEUE',
    title: 'New Booking Slot Reserved',
    message: 'Rajesh Kumar booked slot 3:30–4:00 PM for 20 QTL Sharbati Wheat (Token #MKT-B-142).',
    timestamp: '25m ago',
    read: false,
    actionRoute: 'QueueControlPanel',
  },
  {
    id: 'notif-04',
    recipientRole: 'BUYER',
    category: 'OFFER',
    title: 'High Quality Lot Approaching',
    message: 'Lot #WH-098 with preliminary AI Grade A (88/100) assigned to Gate 2 Express Line.',
    timestamp: '35m ago',
    read: true,
    actionRoute: 'IncomingLots',
  },
];

class MockStore {
  private getFreshSeedState(): AppState {
    return {
      currentRole: 'FARMER',
      language: 'en',
      farmer: JSON.parse(JSON.stringify(initialFarmer)),
      buyer: JSON.parse(JSON.stringify(initialBuyer)),
      lots: JSON.parse(JSON.stringify(initialLots)),
      activeLotId: 'lot-wh-098',
      markets: JSON.parse(JSON.stringify(initialMarkets)),
      recommendation: JSON.parse(JSON.stringify(initialRecommendation)),
      bookings: JSON.parse(JSON.stringify(initialBookings)),
      activeBookingId: 'booking-b142',
      queue: JSON.parse(JSON.stringify(initialQueue)),
      inspections: JSON.parse(JSON.stringify(initialInspections)),
      weighments: JSON.parse(JSON.stringify(initialWeighments)),
      offers: JSON.parse(JSON.stringify(initialOffers)),
      activeOfferId: 'booking-b142',
      transactions: JSON.parse(JSON.stringify(initialTransactions)),
      activeTransactionId: 'txn-28491',
      demands: JSON.parse(JSON.stringify(initialDemands)),
      notifications: JSON.parse(JSON.stringify(initialNotifications)),
    };
  }

  private state: AppState = this.getFreshSeedState();

  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public getState(): AppState {
    return this.state;
  }

  // Cross-User Role Switching
  public setRole(role: UserRole): void {
    this.state.currentRole = role;
    this.notify();
  }

  public setLanguage(language: FarmerLanguage): void {
    this.state.language = language;
    this.notify();
  }

  // Live Queue & Dynamic State Controls
  public setDepartureState(departureState: DepartureState): void {
    this.state.queue.departureState = departureState;
    if (departureState === 'WAIT') {
      this.state.queue.delayMinutes = 40;
      this.state.queue.revisedDepartureTime = '3:15 PM';
    } else if (departureState === 'GET_READY') {
      this.state.queue.delayMinutes = 15;
      this.state.queue.revisedDepartureTime = '3:45 PM';
    } else if (departureState === 'LEAVE_NOW') {
      this.state.queue.delayMinutes = 0;
      this.state.queue.revisedDepartureTime = 'NOW';
      // Step tracker moves to transit
      this.state.queue.journeySteps[1].status = 'completed';
      this.state.queue.journeySteps[2].status = 'current';
    } else if (departureState === 'ARRIVED') {
      this.state.queue.journeySteps[2].status = 'completed';
      this.state.queue.journeySteps[3].status = 'current';
    }
    this.notify();
  }

  public addQueueDelay(minutes: number): void {
    this.state.queue.delayMinutes += minutes;
    this.state.queue.departureState = 'WAIT';
    this.state.queue.gateNotice = {
      time: 'Just now',
      message: `Mandi Operator added +${minutes} min gate delay. Please remain at farm.`,
    };
    this.addNotification({
      recipientRole: 'FARMER',
      category: 'QUEUE',
      title: `Gate Delay (+${minutes} min)`,
      message: `Taraori Mandi queue delayed. Revised departure ETA adjusted.`,
      actionRoute: 'LiveMandiQueue',
    });
    this.notify();
  }

  public clearQueueDelay(): void {
    this.state.queue.delayMinutes = 0;
    this.state.queue.departureState = 'LEAVE_NOW';
    this.state.queue.gateNotice = {
      time: 'Just now',
      message: 'Gate cleared! Please leave for Taraori Mandi Gate 2 Express Line now.',
    };
    this.addNotification({
      recipientRole: 'FARMER',
      category: 'QUEUE',
      title: 'Leave for Mandi Now!',
      message: 'Gate congestion cleared. Proceed to Gate 2 Express Line.',
      actionRoute: 'LiveMandiQueue',
      badge: 'LEAVE NOW',
    });
    this.notify();
  }

  public checkInFarmer(): void {
    this.state.queue.departureState = 'ARRIVED';
    this.state.queue.lotsAhead = 0;
    this.state.queue.journeySteps[1].status = 'completed';
    this.state.queue.journeySteps[2].status = 'completed';
    this.state.queue.journeySteps[3].status = 'completed';
    this.state.queue.journeySteps[4].status = 'current';

    // Update lot status
    const lot = this.state.lots.find((l) => l.id === this.state.activeLotId);
    if (lot) {
      lot.status = 'GATE_CHECKED_IN';
    }

    this.addNotification({
      recipientRole: 'BUYER',
      category: 'QUEUE',
      title: 'Farmer Checked In at Gate 2',
      message: 'Rajesh Kumar (Token #MKT-B-142) has arrived. Bay 3 ready for physical inspection.',
      actionRoute: 'QueueControlPanel',
    });
    this.notify();
  }

  // Inspection & Weighment
  public submitPhysicalInspection(inspection: Partial<PhysicalInspection>): void {
    const bookingId = this.state.activeBookingId;
    this.state.inspections[bookingId] = {
      ...this.state.inspections[bookingId],
      ...inspection,
    } as PhysicalInspection;

    const lot = this.state.lots.find((l) => l.id === this.state.activeLotId);
    if (lot) {
      lot.status = 'PHYSICALLY_INSPECTED';
    }

    this.state.queue.journeySteps[3].status = 'completed';
    this.state.queue.journeySteps[4].status = 'current';

    this.addNotification({
      recipientRole: 'FARMER',
      category: 'SYSTEM',
      title: 'Quality Verification Completed',
      message: 'Physical grading verified Grade A (89/100, 11.8% moisture). Proceeding to weighbridge.',
      actionRoute: 'PhysicalInspectionResult',
    });
    this.notify();
  }

  public recordWeighment(weighment: Partial<WeighmentRecord>): void {
    const bookingId = this.state.activeBookingId;
    this.state.weighments[bookingId] = {
      ...this.state.weighments[bookingId],
      ...weighment,
    } as WeighmentRecord;

    const lot = this.state.lots.find((l) => l.id === this.state.activeLotId);
    if (lot) {
      lot.status = 'WEIGHED';
    }

    this.state.queue.journeySteps[4].status = 'completed';

    this.addNotification({
      recipientRole: 'FARMER',
      category: 'SYSTEM',
      title: 'Scale Weighment Verified',
      message: 'Scale gross: 5,420 kg • Tare: 3,450 kg • Final Net Weight: 19.70 Quintals recorded.',
      actionRoute: 'WeighmentResult',
    });
    this.notify();
  }

  // Offer Creation & Settlement
  public submitOffer(offer: Partial<BuyerOffer>): void {
    const bookingId = this.state.activeBookingId;
    this.state.offers[bookingId] = {
      ...this.state.offers[bookingId],
      ...offer,
      status: 'PENDING',
    } as BuyerOffer;

    const lot = this.state.lots.find((l) => l.id === this.state.activeLotId);
    if (lot) {
      lot.status = 'OFFER_RECEIVED';
    }

    this.addNotification({
      recipientRole: 'FARMER',
      category: 'OFFER',
      title: 'Buyer Offer Received!',
      message: `Buyer submitted binding offer of ₹${(offer.netPayout || 48654.5).toLocaleString('en-IN')} for 19.70 QTL. Tap to review.`,
      actionRoute: 'FarmerOfferDecision',
      badge: 'OFFER',
    });
    this.notify();
  }

  public acceptOffer(): void {
    const bookingId = this.state.activeBookingId;
    if (this.state.offers[bookingId]) {
      this.state.offers[bookingId].status = 'ACCEPTED';
    }

    const lot = this.state.lots.find((l) => l.id === this.state.activeLotId);
    if (lot) {
      lot.status = 'OFFER_ACCEPTED';
    }

    const txn = this.state.transactions.find((t) => t.bookingId === bookingId);
    if (txn) {
      txn.paymentStatus = 'PROCESSING';
    }

    this.addNotification({
      recipientRole: 'BUYER',
      category: 'OFFER',
      title: 'Offer Accepted by Farmer',
      message: 'Rajesh Kumar accepted ₹48,654.50 offer. Please release payment.',
      actionRoute: 'BuyerTransactions',
    });
    this.notify();
  }

  public rejectOffer(offerIdOrReason?: string): void {
    const bookingId = this.state.activeBookingId;
    if (this.state.offers[bookingId]) {
      this.state.offers[bookingId].status = 'REJECTED';
    }
    const lot = this.state.lots.find((l) => l.id === this.state.activeLotId);
    if (lot) {
      lot.status = 'REJECTED';
    }
    this.addNotification({
      recipientRole: 'BUYER',
      category: 'OFFER',
      title: 'Offer Rejected',
      message: 'Farmer declined purchase offer. Counter negotiations may be opened.',
      actionRoute: 'BuyerTransactions',
    });
    this.notify();
  }

  public callNextLot(): void {
    if (this.state.queue.lotsAhead > 0) {
      this.state.queue.lotsAhead -= 1;
    }
    this.addNotification({
      recipientRole: 'FARMER',
      category: 'QUEUE',
      title: 'Queue Advanced',
      message: 'A lot has completed weighment. Bay 3 queue is advancing.',
      actionRoute: 'LiveMandiQueue',
    });
    this.notify();
  }

  public releasePayment(): void {
    const bookingId = this.state.activeBookingId;
    const txn = this.state.transactions.find((t) => t.bookingId === bookingId);
    if (txn) {
      txn.paymentStatus = 'PAID';
      if (txn.receipt) {
        txn.receipt.status = 'PAID';
      }
    }

    const lot = this.state.lots.find((l) => l.id === this.state.activeLotId);
    if (lot) {
      lot.status = 'PAID';
    }

    this.state.queue.journeySteps[5].status = 'completed';

    this.addNotification({
      recipientRole: 'FARMER',
      category: 'PAYMENT',
      title: 'Payment Credited ₹48,654.50',
      message: 'Direct benefit transfer completed via UPI to your State Bank of India account. J-Form receipt generated.',
      actionRoute: 'PaymentStatus',
      badge: 'PAID',
    });
    this.notify();
  }

  public addCropLot(lot: CropLot): void {
    this.state.lots.unshift(lot);
    this.state.activeLotId = lot.id;
    this.notify();
  }

  public addDemand(demand: MarketDemand): void {
    this.state.demands.unshift(demand);
    this.notify();
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    this.state.notifications.unshift(newNotif);
    this.notify();
  }

  public markNotificationAsRead(id: string): void {
    const item = this.state.notifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead(): void {
    for (const n of this.state.notifications) {
      n.read = true;
    }
    this.notify();
  }

  public resetScenario(): void {
    const language = this.state.language;
    this.state = this.getFreshSeedState();
    this.state.language = language;
    this.notify();
  }

  public requestBetterOffer(): void {
    this.addNotification({
      recipientRole: 'BUYER',
      category: 'OFFER',
      title: 'Farmer requested a better price',
      message: 'Rajesh Kumar asked you to review and improve the current crop offer.',
      actionRoute: 'BuyerTransactions',
    });
    this.addNotification({
      recipientRole: 'FARMER',
      category: 'OFFER',
      title: 'Request sent',
      message: 'The buyer has been asked to send a better price.',
      actionRoute: 'FarmerOfferDecision',
    });
    this.notify();
  }
}

export const mockStore = new MockStore();
