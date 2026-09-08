export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface BuyerOffer {
  id: string;
  bookingId: string;
  lotId: string;
  buyerId: string;
  buyerName: string;
  buyerFirmName?: string;
  crop?: string;
  variety?: string;
  cropVariety: string;
  quantityQuintals: number;
  netQuintals?: number;
  finalGrade: string;
  ratePerQuintal: number;
  offeredPricePerQuintal?: number;
  grossAmount: number;
  deductions: {
    mandiCess: number;
    unloadingFee: number;
    qualityAdjustment: number;
  };
  mandiFee?: number;
  weighmentCharge?: number;
  totalDeductions: number;
  netPayout: number;
  paymentMode: 'Instant UPI' | 'Direct Bank Credit' | 'T+1 Escrow';
  expiryMinutes: number;
  expiresAt?: string;
  terms?: string;
  status: OfferStatus;
  createdAt: string;
}
