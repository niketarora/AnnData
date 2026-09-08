import { appEvents } from './eventEmitter.js';
import { Booking } from '../types/index.js';

export const BOOKING_EVENTS = {
  REQUESTED: 'booking:requested',
  ACCEPTED: 'booking:accepted',
  REJECTED: 'booking:rejected',
  SLOT_ASSIGNED: 'booking:slot_assigned',
  CHECKED_IN: 'booking:checked_in',
  CANCELLED: 'booking:cancelled',
};

export function emitBookingEvent(event: string, booking: Booking): void {
  appEvents.emitEvent(event, {
    bookingId: booking.id,
    lotId: booking.lot_id,
    buyerId: booking.buyer_id,
    token: booking.token,
    status: booking.status,
    timestamp: new Date().toISOString(),
  });
}
