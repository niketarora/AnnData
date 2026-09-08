import { bookingsRepository } from '../repositories/bookings.repository.js';
import { lotsRepository } from '../repositories/lots.repository.js';
import { queueRepository } from '../repositories/queue.repository.js';
import { notificationsRepository } from '../repositories/notifications.repository.js';
import { auditLogsRepository } from '../repositories/auditLogs.repository.js';
import { profilesRepository } from '../repositories/profiles.repository.js';
import { farmersRepository } from '../repositories/farmers.repository.js';
import { buyersRepository } from '../repositories/buyers.repository.js';
import { Booking, BookingStatus } from '../types/index.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';
import { emitBookingEvent, BOOKING_EVENTS } from '../events/booking.events.js';

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  REQUESTED: ['ACCEPTED', 'REJECTED', 'SLOT_ASSIGNED', 'CANCELLED'],
  ACCEPTED: ['SLOT_ASSIGNED', 'CANCELLED'],
  REJECTED: [],
  SLOT_ASSIGNED: ['CHECKED_IN', 'CANCELLED', 'EXPIRED'],
  CHECKED_IN: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export class BookingsService {
  async getFarmerBookings(farmerId: string): Promise<Booking[]> {
    return bookingsRepository.findAll({ farmerId });
  }

  async getBuyerBookings(buyerId: string): Promise<Booking[]> {
    return bookingsRepository.findAll({ buyerId });
  }

  async getBookingById(id: string, userRole: string, farmerId?: string, buyerId?: string): Promise<Booking> {
    const booking = await bookingsRepository.findById(id);
    if (!booking) throw new NotFoundError(`Booking not found with ID ${id}`);

    if (userRole === 'farmer' && farmerId) {
      const lot = await lotsRepository.findById(booking.lot_id);
      if (!lot || lot.farmer_id !== farmerId) {
        throw new ForbiddenError('You can only access your own bookings');
      }
    } else if (userRole === 'buyer' && buyerId && booking.buyer_id !== buyerId) {
      throw new ForbiddenError('You can only access bookings assigned to your counter');
    }

    return booking;
  }

  async createBooking(
    farmerId: string,
    payload: {
      lot_id: string;
      buyer_id: string;
      market_id: string;
      scheduled_date: string;
      slot_start: string;
      slot_end: string;
      driver_name?: string;
      vehicle_number?: string;
    }
  ): Promise<Booking> {
    const lot = await lotsRepository.findById(payload.lot_id);
    if (!lot) throw new NotFoundError('Crop lot not found');
    if (lot.farmer_id !== farmerId) throw new ForbiddenError('You can only book for your own crop lots');

    const booking = await bookingsRepository.create({
      ...payload,
      departure_state: 'WAIT',
      travel_eta_minutes: 18,
      delay_minutes: 0,
      status: 'REQUESTED',
    });

    await lotsRepository.update(lot.id, { status: 'BOOKING_REQUESTED' });
    emitBookingEvent(BOOKING_EVENTS.REQUESTED, booking);

    // Notify buyer of new booking request
    const buyer = await buyersRepository.findById(payload.buyer_id);
    if (buyer) {
      await notificationsRepository.create({
        user_id: buyer.profile_id,
        role: 'BUYER',
        category: 'BOOKING',
        title: 'New Booking Slot Request',
        message: `Farmer requested booking for ${lot.quantity} QTL ${lot.variety} on ${payload.scheduled_date}.`,
        action_route: 'QueueControlPanel',
        read: false,
      });
    }

    await auditLogsRepository.log(farmerId, 'CREATE_BOOKING', 'bookings', booking.id);
    return booking;
  }

  async acceptBookingAndAssignSlot(
    bookingId: string,
    buyerId: string,
    slotStart: string,
    slotEnd: string,
    marketCode = 'MKT-B'
  ): Promise<Booking> {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.buyer_id !== buyerId) throw new ForbiddenError('Only the assigned buyer can accept this booking');

    this.validateStatusTransition(booking.status, 'SLOT_ASSIGNED');

    // Generate unique token
    const existingTokens = await queueRepository.findByMarketId(booking.market_id);
    const seq = existingTokens.length > 0 ? Math.max(...existingTokens.map((t) => t.sequence_number || 140)) + 1 : 142;
    const tokenStr = `${marketCode}-${seq}`;

    const updated = await bookingsRepository.update(bookingId, {
      status: 'SLOT_ASSIGNED',
      slot_start: slotStart,
      slot_end: slotEnd,
      token: tokenStr,
      revised_processing_time: slotStart,
      recommended_departure_time: '3:15 PM',
      departure_state: 'WAIT',
    });

    // Create queue token
    await queueRepository.createToken({
      booking_id: bookingId,
      market_id: booking.market_id,
      token: tokenStr,
      scheduled_start: slotStart,
      scheduled_end: slotEnd,
      sequence_number: seq,
      status: 'WAITING',
    });

    await lotsRepository.update(booking.lot_id, { status: 'BOOKED' });
    emitBookingEvent(BOOKING_EVENTS.SLOT_ASSIGNED, updated!);

    // Notify farmer
    const lot = await lotsRepository.findById(booking.lot_id);
    if (lot) {
      const farmer = await farmersRepository.findById(lot.farmer_id);
      if (farmer) {
        await notificationsRepository.create({
          user_id: farmer.profile_id,
          role: 'FARMER',
          category: 'BOOKING',
          title: `Slot Assigned (${tokenStr})`,
          message: `Your booking is confirmed for ${slotStart}–${slotEnd}. Token #${tokenStr} generated.`,
          action_route: 'LiveMandiQueue',
          read: false,
        });
      }
    }

    await auditLogsRepository.log(buyerId, 'ASSIGN_SLOT', 'bookings', bookingId, { token: tokenStr });
    return updated!;
  }

  async rejectBooking(bookingId: string, buyerId: string, reason: string): Promise<Booking> {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.buyer_id !== buyerId) throw new ForbiddenError('Only the assigned buyer can reject this booking');

    this.validateStatusTransition(booking.status, 'REJECTED');

    const updated = await bookingsRepository.update(bookingId, { status: 'REJECTED' });
    await lotsRepository.update(booking.lot_id, { status: 'READY' });
    emitBookingEvent(BOOKING_EVENTS.REJECTED, updated!);

    await auditLogsRepository.log(buyerId, 'REJECT_BOOKING', 'bookings', bookingId, { reason });
    return updated!;
  }

  async cancelBooking(bookingId: string, actorId: string, reason: string): Promise<Booking> {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');

    this.validateStatusTransition(booking.status, 'CANCELLED');

    const updated = await bookingsRepository.update(bookingId, { status: 'CANCELLED' });
    await lotsRepository.update(booking.lot_id, { status: 'READY' });
    emitBookingEvent(BOOKING_EVENTS.CANCELLED, updated!);

    await auditLogsRepository.log(actorId, 'CANCEL_BOOKING', 'bookings', bookingId, { reason });
    return updated!;
  }

  private validateStatusTransition(current: BookingStatus, target: BookingStatus): void {
    const allowed = VALID_TRANSITIONS[current] || [];
    if (!allowed.includes(target)) {
      throw new ConflictError(
        `Invalid booking status transition: cannot transition from ${current} to ${target}`
      );
    }
  }
}

export const bookingsService = new BookingsService();
