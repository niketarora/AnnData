import { appEvents } from './eventEmitter.js';
import { Offer } from '../types/index.js';

export const OFFER_EVENTS = {
  SUBMITTED: 'offer:submitted',
  ACCEPTED: 'offer:accepted',
  REJECTED: 'offer:rejected',
};

export function emitOfferEvent(event: string, offer: Offer): void {
  appEvents.emitEvent(event, {
    offerId: offer.id,
    bookingId: offer.booking_id,
    farmerId: offer.farmer_id,
    buyerId: offer.buyer_id,
    netAmount: offer.net_amount,
    status: offer.status,
    timestamp: new Date().toISOString(),
  });
}
