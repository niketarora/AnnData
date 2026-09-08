export * from './interfaces';
export * from './api';
export * from './apiServices';

// Mock services available for offline fallback and isolated unit tests
export * from './mock/farmerMockService';
export * from './mock/buyerMockService';
export * from './mock/marketMockService';
export * from './mock/bookingMockService';
export * from './mock/queueMockService';
export * from './mock/offerMockService';
export * from './mock/transactionMockService';
export * from './mock/notificationMockService';

// Unified service singletons pointing to backend API with automatic offline mock fallback
export {
  apiCropService as cropService,
  apiMarketService as marketService,
  apiBookingService as bookingService,
  apiQueueService as queueService,
  apiInspectionService as inspectionService,
  apiOfferService as offerService,
  apiTransactionService as transactionService,
  apiNotificationService as notificationService,
} from './apiServices';
