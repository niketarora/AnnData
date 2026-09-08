import { apiClient } from './api';
import {
  ICropService,
  IMarketService,
  IBookingService,
  IQueueService,
  IInspectionService,
  IOfferService,
  ITransactionService,
  INotificationService,
} from './interfaces';
import {
  CropLot,
  QualityAssessment,
  Market,
  MarketDemand,
  Recommendation,
  Booking,
  BookingSlot,
  LiveQueueState,
  DepartureState,
  PhysicalInspection,
  WeighmentRecord,
  BuyerOffer,
  Transaction,
  DigitalReceipt,
  AppNotification,
} from '../types';
import { mockStore } from '../store/mockStore';

export class ApiCropService implements ICropService {
  async getCropLots(farmerId?: string): Promise<CropLot[]> {
    try {
      const data = await apiClient.get<CropLot[]>('/farmers/lots');
      return data;
    } catch {
      return mockStore.getState().lots;
    }
  }

  async getCropLotById(id: string): Promise<CropLot | undefined> {
    try {
      const data = await apiClient.get<CropLot>(`/lots/${id}`);
      return data;
    } catch {
      return mockStore.getState().lots.find((l) => l.id === id);
    }
  }

  async createCropLot(lot: Omit<CropLot, 'id' | 'status' | 'createdAt'>): Promise<CropLot> {
    try {
      const created = await apiClient.post<CropLot>('/farmers/lots', {
        crop_id: 'c0000000-0000-0000-0000-000000000001',
        variety: lot.variety,
        quantity: lot.quantityQuintals,
        unit: 'Quintal',
        farm_location: lot.farmLocation,
        expected_harvest_date: lot.harvestDate,
        images: lot.images,
      });
      mockStore.addCropLot(created);
      return created;
    } catch {
      const newLot: CropLot = {
        ...lot,
        id: `lot-wh-${Date.now().toString().slice(-4)}`,
        status: 'AI_GRADED',
        createdAt: new Date().toISOString().split('T')[0],
      };
      mockStore.addCropLot(newLot);
      return newLot;
    }
  }

  async assessQuality(lotId: string, _images: string[]): Promise<QualityAssessment> {
    const lot = await this.getCropLotById(lotId);
    if (lot?.qualityAssessment) {
      return lot.qualityAssessment;
    }
    return {
      id: `qa-${Date.now().toString().slice(-4)}`,
      overallScore: 88,
      predictedGrade: 'Grade A',
      confidenceScore: 91,
      tierLabel: 'Top Quality Tier',
      varietyBenchmark: 'Sharbati Gold Premium',
      minEstimatedPrice: 2420,
      maxEstimatedPrice: 2560,
      factors: [
        { name: 'Moisture', description: 'Optimal dryness', value: '11.8%', percent: 12, status: 'success', icon: 'water_drop' },
        { name: 'Foreign Matter', description: 'Negligible admixture', value: '0.6%', percent: 6, status: 'success', icon: 'filter_alt' },
      ],
      photos: [],
      assessedAt: new Date().toISOString(),
      modelVersion: 'OASSM-10-v2',
      isPreliminary: false,
    };
  }
}

export class ApiMarketService implements IMarketService {
  async getAvailableMarkets(): Promise<Market[]> {
    try {
      return await apiClient.get<Market[]>('/markets');
    } catch {
      return mockStore.getState().markets;
    }
  }

  async getMarketById(id: string): Promise<Market | undefined> {
    try {
      return await apiClient.get<Market>(`/markets/${id}`);
    } catch {
      return mockStore.getState().markets.find((m) => m.id === id);
    }
  }

  async getMarketRecommendation(lotId: string): Promise<Recommendation> {
    try {
      return await apiClient.get<Recommendation>(`/lots/${lotId}/recommendations`);
    } catch {
      return mockStore.getState().recommendation;
    }
  }

  async getBuyerDemands(mandiId?: string): Promise<MarketDemand[]> {
    try {
      return await apiClient.get<MarketDemand[]>('/demands');
    } catch {
      return mockStore.getState().demands;
    }
  }

  async createBuyerDemand(
    demand: Omit<MarketDemand, 'id' | 'fulfilledQuantityQuintals' | 'status'>
  ): Promise<MarketDemand> {
    try {
      const created = await apiClient.post<MarketDemand>('/buyers/demands', {
        crop_id: 'c0000000-0000-0000-0000-000000000001',
        variety: demand.variety,
        minimum_grade: demand.minimumGrade,
        quantity_required: demand.requiredQuantityQuintals,
        indicative_price_min: demand.minPrice,
        indicative_price_max: demand.maxPrice,
        buying_date: demand.targetDate,
        processing_counters: demand.assignedCounter,
        location: demand.mandiName,
      });
      mockStore.addDemand(created);
      return created;
    } catch {
      const newDemand: MarketDemand = {
        ...demand,
        id: `dem-${Date.now().toString().slice(-4)}`,
        fulfilledQuantityQuintals: 0,
        status: 'ACTIVE',
      };
      mockStore.addDemand(newDemand);
      return newDemand;
    }
  }
}

export class ApiBookingService implements IBookingService {
  async getAvailableSlots(_marketId: string, _date: string): Promise<BookingSlot[]> {
    return [
      { id: 'slot-1', startTime: '08:00', endTime: '09:00', displayTime: '08:00 – 09:00 AM', availableSpots: 4 },
      { id: 'slot-2', startTime: '10:30', endTime: '11:30', displayTime: '10:30 – 11:30 AM', availableSpots: 5 },
      { id: 'slot-3', startTime: '13:00', endTime: '14:00', displayTime: '01:00 – 02:00 PM', availableSpots: 1 },
      { id: 'slot-5', startTime: '15:30', endTime: '16:00', displayTime: '03:30 – 04:00 PM', availableSpots: 6 },
    ];
  }

  async createBooking(
    lotId: string,
    marketId: string,
    slotId: string,
    vehicleNumber: string,
    driverName: string
  ): Promise<Booking> {
    const tokenNum = `MKT-B-${Math.floor(100 + Math.random() * 900)}`;
    const market = mockStore.getState().markets.find((m) => m.id === marketId);
    try {
      const created = await apiClient.post<Booking>('/farmers/bookings', {
        lot_id: lotId,
        buyer_id: 'b0000000-0000-0000-0000-000000000001',
        market_id: marketId,
        scheduled_date: new Date().toISOString().split('T')[0],
        slot_start: '3:30 PM',
        slot_end: '4:00 PM',
        driver_name: driverName,
        vehicle_number: vehicleNumber,
      });
      const state = mockStore.getState();
      state.bookings.unshift(created);
      state.activeBookingId = created.id;
      return created;
    } catch {
      const fallbackBooking: Booking = {
        id: `booking-${Date.now()}`,
        tokenNumber: tokenNum,
        lotId,
        farmerId: mockStore.getState().farmer.id,
        farmerName: mockStore.getState().farmer.name,
        marketId,
        marketName: market?.name || 'Taraori APMC Mandi',
        destinationMandi: `${market?.name || 'Taraori'} Gate 2`,
        scheduledSlot: '03:30 – 04:00 PM',
        date: 'Today, 08 Sep 2026',
        vehicleNumber,
        driverName,
        assignedGate: 'Gate 2 Express Line',
        status: 'CONFIRMED',
        createdAt: 'Just now',
      };
      const state = mockStore.getState();
      state.bookings.unshift(fallbackBooking);
      state.activeBookingId = fallbackBooking.id;
      state.queue.tokenNumber = tokenNum;
      return fallbackBooking;
    }
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    try {
      return await apiClient.get<Booking>(`/bookings/${id}`);
    } catch {
      return mockStore.getState().bookings.find((b) => b.id === id);
    }
  }

  async getFarmerBookings(farmerId?: string): Promise<Booking[]> {
    try {
      return await apiClient.get<Booking[]>('/farmers/bookings');
    } catch {
      return mockStore.getState().bookings;
    }
  }

  async getBuyerBookings(marketId?: string): Promise<Booking[]> {
    try {
      return await apiClient.get<Booking[]>('/buyers/bookings');
    } catch {
      return mockStore.getState().bookings;
    }
  }
}

export class ApiQueueService implements IQueueService {
  async getLiveQueueStatus(bookingId: string): Promise<LiveQueueState> {
    try {
      return await apiClient.get<LiveQueueState>(`/queue/${bookingId}`);
    } catch {
      return mockStore.getState().queue;
    }
  }

  async updateDepartureState(bookingId: string, newState: DepartureState): Promise<LiveQueueState> {
    try {
      return await apiClient.post<LiveQueueState>(`/queue/${bookingId}/departure-state`, {
        departure_state: newState,
      });
    } catch {
      mockStore.setDepartureState(newState);
      return mockStore.getState().queue;
    }
  }

  async addQueueDelay(minutes: number): Promise<LiveQueueState> {
    try {
      const activeBookingId = mockStore.getState().activeBookingId || 'e0000000-0000-0000-0000-000000000142';
      return await apiClient.post<LiveQueueState>(`/queue/${activeBookingId}/delay`, {
        minutes,
      });
    } catch {
      mockStore.addQueueDelay(minutes);
      return mockStore.getState().queue;
    }
  }

  async clearDelay(): Promise<LiveQueueState> {
    try {
      const activeBookingId = mockStore.getState().activeBookingId || 'e0000000-0000-0000-0000-000000000142';
      return await apiClient.post<LiveQueueState>(`/queue/${activeBookingId}/clear-delay`);
    } catch {
      mockStore.clearQueueDelay();
      return mockStore.getState().queue;
    }
  }

  async callNextLot(): Promise<LiveQueueState> {
    try {
      const activeBookingId = mockStore.getState().activeBookingId || 'e0000000-0000-0000-0000-000000000142';
      return await apiClient.post<LiveQueueState>(`/queue/${activeBookingId}/advance`);
    } catch {
      mockStore.callNextLot();
      return mockStore.getState().queue;
    }
  }
}

export class ApiInspectionService implements IInspectionService {
  async getInspectionByBooking(bookingId: string): Promise<PhysicalInspection | undefined> {
    try {
      return await apiClient.get<PhysicalInspection>(`/inspections/booking/${bookingId}`);
    } catch {
      return mockStore.getState().inspections[bookingId];
    }
  }

  async submitPhysicalInspection(
    data: Omit<PhysicalInspection, 'id' | 'inspectedAt'>
  ): Promise<PhysicalInspection> {
    try {
      const activeBookingId = mockStore.getState().activeBookingId || 'e0000000-0000-0000-0000-000000000142';
      const lotId = mockStore.getState().activeLotId || 'd0000000-0000-0000-0000-000000000098';
      return await apiClient.post<PhysicalInspection>('/inspections', {
        booking_id: activeBookingId,
        lot_id: lotId,
        physical_grade: data.physicalGrade,
        quality_score: data.verifiedScore,
        moisture: data.moisturePercent,
        defects: data.foreignMatterPercent,
        notes: data.inspectorNotes,
      });
    } catch {
      mockStore.submitPhysicalInspection(data);
      const activeBookingId = mockStore.getState().activeBookingId;
      return mockStore.getState().inspections[activeBookingId];
    }
  }

  async getWeighmentByBooking(bookingId: string): Promise<WeighmentRecord | undefined> {
    try {
      return await apiClient.get<WeighmentRecord>(`/weighments/booking/${bookingId}`);
    } catch {
      return mockStore.getState().weighments[bookingId];
    }
  }

  async recordWeighment(
    data: Omit<WeighmentRecord, 'id' | 'weighedAt'>
  ): Promise<WeighmentRecord> {
    try {
      const activeBookingId = mockStore.getState().activeBookingId || 'e0000000-0000-0000-0000-000000000142';
      const lotId = mockStore.getState().activeLotId || 'd0000000-0000-0000-0000-000000000098';
      return await apiClient.post<WeighmentRecord>('/weighments', {
        booking_id: activeBookingId,
        lot_id: lotId,
        expected_quantity: 20.0,
        gross_weight: data.grossWeightKg,
        tare_weight: data.tareWeightKg,
        actual_quantity: data.netQuintals,
        unit: 'Quintal',
      });
    } catch {
      mockStore.recordWeighment(data);
      const activeBookingId = mockStore.getState().activeBookingId;
      return mockStore.getState().weighments[activeBookingId];
    }
  }
}

export class ApiOfferService implements IOfferService {
  async getOfferByBooking(bookingId: string): Promise<BuyerOffer | undefined> {
    try {
      return await apiClient.get<BuyerOffer>(`/offers/booking/${bookingId}`);
    } catch {
      return mockStore.getState().offers[bookingId];
    }
  }

  async createOffer(offer: Omit<BuyerOffer, 'id' | 'status' | 'createdAt'>): Promise<BuyerOffer> {
    try {
      const activeBookingId = mockStore.getState().activeBookingId || 'e0000000-0000-0000-0000-000000000142';
      const lotId = mockStore.getState().activeLotId || 'd0000000-0000-0000-0000-000000000098';
      return await apiClient.post<BuyerOffer>('/offers', {
        booking_id: activeBookingId,
        lot_id: lotId,
        price_per_unit: offer.ratePerQuintal,
        quantity: offer.quantityQuintals,
        freight_cost: 720,
        mandi_cess: offer.deductions?.mandiCess || 744.66,
        unloading_charges: offer.deductions?.unloadingFee || 300,
        notes: `Purchase offer for ${offer.cropVariety}`,
      });
    } catch {
      mockStore.submitOffer(offer);
      const activeBookingId = mockStore.getState().activeBookingId;
      return mockStore.getState().offers[activeBookingId];
    }
  }

  async acceptOffer(offerId: string): Promise<BuyerOffer> {
    try {
      const res = await apiClient.post<{ offer: BuyerOffer }>(`/offers/${offerId}/accept`);
      mockStore.acceptOffer();
      return res.offer;
    } catch {
      mockStore.acceptOffer();
      const activeBookingId = mockStore.getState().activeBookingId;
      return mockStore.getState().offers[activeBookingId];
    }
  }

  async rejectOffer(offerId: string): Promise<BuyerOffer> {
    try {
      const res = await apiClient.post<BuyerOffer>(`/offers/${offerId}/reject`);
      mockStore.rejectOffer();
      return res;
    } catch {
      mockStore.rejectOffer();
      const activeBookingId = mockStore.getState().activeBookingId;
      return mockStore.getState().offers[activeBookingId];
    }
  }
}

export class ApiTransactionService implements ITransactionService {
  async getTransactions(userId?: string): Promise<Transaction[]> {
    try {
      return await apiClient.get<Transaction[]>('/transactions');
    } catch {
      return mockStore.getState().transactions;
    }
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    try {
      return await apiClient.get<Transaction>(`/transactions/${id}`);
    } catch {
      return mockStore.getState().transactions.find((t) => t.id === id);
    }
  }

  async getReceiptByTransaction(transactionId: string): Promise<DigitalReceipt | undefined> {
    try {
      return await apiClient.get<DigitalReceipt>(`/transactions/${transactionId}/receipt`);
    } catch {
      const txn = mockStore.getState().transactions.find((t) => t.id === transactionId);
      return txn?.receipt;
    }
  }

  async releasePayment(transactionId: string): Promise<Transaction> {
    try {
      const res = await apiClient.post<Transaction>(`/payments/release/${transactionId}`);
      mockStore.releasePayment();
      return res;
    } catch {
      mockStore.releasePayment();
      return mockStore.getState().transactions[0];
    }
  }
}

export class ApiNotificationService implements INotificationService {
  async getNotifications(role?: 'FARMER' | 'BUYER'): Promise<AppNotification[]> {
    try {
      return await apiClient.get<AppNotification[]>('/notifications');
    } catch {
      return mockStore.getState().notifications;
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch {
      mockStore.markNotificationAsRead(id);
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.post('/notifications/read-all');
    } catch {
      mockStore.markAllNotificationsAsRead();
    }
  }
}

// Singletons
export const apiCropService = new ApiCropService();
export const apiMarketService = new ApiMarketService();
export const apiBookingService = new ApiBookingService();
export const apiQueueService = new ApiQueueService();
export const apiInspectionService = new ApiInspectionService();
export const apiOfferService = new ApiOfferService();
export const apiTransactionService = new ApiTransactionService();
export const apiNotificationService = new ApiNotificationService();
