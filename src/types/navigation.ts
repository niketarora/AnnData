export type RootStackParamList = {
  Welcome: undefined;
  RoleSelection: undefined;
  LoginOTP: { role: 'FARMER' | 'BUYER' };
  FarmerOnboarding: undefined;
  FarmerRoot: undefined;
  BuyerRoot: undefined;
};

export type FarmerTabParamList = {
  FarmerHomeTab: undefined;
  FarmerMarketsTab: undefined;
  FarmerSellTab: undefined;
  FarmerBookingsTab: undefined;
  FarmerProfileTab: undefined;
};

export type FarmerStackParamList = {
  FarmerHome: undefined;
  CropLotsList: undefined;
  CropDetails: { lotId: string };
  CreateCropLot: undefined;
  CropQualityResult: { lotId: string };
  MarketIntelligence: undefined;
  BestPlacesToSell: undefined;
  MarketDetails: { marketId: string };
  BookSlot: { marketId: string };
  BookingConfirmation: { bookingId: string };
  LiveMandiQueue: { bookingId?: string };
  TransitNavigation: { bookingId?: string };
  FarmerCheckIn: { bookingId?: string };
  PhysicalInspectionResult: { bookingId?: string };
  WeighmentResult: { bookingId?: string };
  FarmerOfferDecision: { offerId?: string };
  PaymentStatus: { transactionId?: string };
  DigitalReceipt: { transactionId?: string };
  SalesHistory: undefined;
  Notifications: undefined;
  FarmerProfile: undefined;
};

export type BuyerTabParamList = {
  BuyerDashboardTab: undefined;
  BuyerDemandTab: undefined;
  BuyerIncomingLotsTab: undefined;
  BuyerQueueTab: undefined;
  BuyerTransactionsTab: undefined;
};

export type BuyerStackParamList = {
  BuyerDashboard: undefined;
  DemandManagement: undefined;
  CreateDemand: undefined;
  IncomingLots: undefined;
  BuyerLotDetails: { lotId: string };
  BuyerBookingCalendar: undefined;
  QueueControlPanel: undefined;
  PhysicalInspectionStation: { bookingId: string };
  WeighbridgeStation: { bookingId: string };
  BuyerOfferCreation: { bookingId: string };
  BuyerTransactions: undefined;
  BuyerAnalytics: undefined;
  BuyerNotifications: undefined;
  BuyerProfile: undefined;
};
