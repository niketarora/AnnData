export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'DISPUTED';

export interface DigitalReceipt {
  receiptNumber: string; // J-Form or K-Form receipt #
  transactionId: string;
  date: string;
  farmerName: string;
  buyerName: string;
  marketName: string;
  cropName: string;
  variety: string;
  finalWeightQuintals: number;
  grade: string;
  ratePerQuintal: number;
  grossAmount: number;
  mandiFee: number;
  netPaidAmount: number;
  paymentMode: string;
  bankRefNumber: string;
  status: 'PAID';
}

export interface Transaction {
  id: string;
  bookingId: string;
  offerId: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  crop: string;
  lotId?: string;
  quantityQuintals: number;
  pricePerQuintal?: number;
  netAmount: number;
  paymentStatus: PaymentStatus;
  paymentMode: string;
  bankReference: string;
  utrNumber?: string;
  receipt?: DigitalReceipt;
  createdAt: string;
}
