import { BuyerOffer } from '../../types';

export interface IOfferService {
  getOfferByBooking(bookingId: string): Promise<BuyerOffer | undefined>;
  createOffer(offer: Omit<BuyerOffer, 'id' | 'status' | 'createdAt'>): Promise<BuyerOffer>;
  acceptOffer(offerId: string): Promise<BuyerOffer>;
  rejectOffer(offerId: string): Promise<BuyerOffer>;
}
