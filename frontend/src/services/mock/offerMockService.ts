import { IOfferService } from '../interfaces/IOfferService';
import { BuyerOffer } from '../../types';
import { mockStore } from '../../store';

export class OfferMockService implements IOfferService {
  async getOfferByBooking(bookingId: string): Promise<BuyerOffer | undefined> {
    return mockStore.getState().offers[bookingId];
  }

  async createOffer(offerData: Omit<BuyerOffer, 'id' | 'status' | 'createdAt'>): Promise<BuyerOffer> {
    const offer: BuyerOffer = {
      ...offerData,
      id: `offer-${Date.now()}`,
      status: 'PENDING',
      createdAt: 'Just now',
    };
    mockStore.submitOffer(offer);
    return offer;
  }

  async acceptOffer(offerId: string): Promise<BuyerOffer> {
    mockStore.acceptOffer();
    const bookingId = mockStore.getState().activeBookingId;
    return mockStore.getState().offers[bookingId];
  }

  async rejectOffer(offerId: string): Promise<BuyerOffer> {
    const bookingId = mockStore.getState().activeBookingId;
    const offer = mockStore.getState().offers[bookingId];
    if (offer) {
      offer.status = 'REJECTED';
    }
    return offer;
  }
}

export const offerMockService = new OfferMockService();
