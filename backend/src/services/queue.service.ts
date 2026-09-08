import { bookingsRepository } from '../repositories/bookings.repository.js';
import { queueRepository } from '../repositories/queue.repository.js';
import { lotsRepository } from '../repositories/lots.repository.js';
import { notificationsRepository } from '../repositories/notifications.repository.js';
import { farmersRepository } from '../repositories/farmers.repository.js';
import { buyersRepository } from '../repositories/buyers.repository.js';
import { auditLogsRepository } from '../repositories/auditLogs.repository.js';
import { calculateQueueEstimate } from '../utils/queue.js';
import { NotFoundError } from '../utils/errors.js';
import { DepartureState, QueueStatus } from '../types/index.js';
import { emitQueueDelayEvent, emitQueueStateChanged } from '../events/queue.events.js';

export interface LiveQueueStateDTO {
  bookingId: string;
  tokenNumber: string;
  counterId: string;
  gateName: string;
  lotsAhead: number;
  activeCounters: number;
  delayMinutes: number;
  estimatedWaitMinutes: number;
  departureState: DepartureState;
  departureRecommendationText: string;
  revisedDepartureTime: string;
  revisedProcessingTime: string;
  gateNotice?: {
    time: string;
    message: string;
  };
  journeySteps: Array<{
    title: string;
    description: string;
    status: 'pending' | 'current' | 'completed';
  }>;
}

export class QueueService {
  async getQueueState(bookingId: string): Promise<LiveQueueStateDTO> {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundError(`Booking not found with ID ${bookingId}`);

    const token = await queueRepository.findByBookingId(bookingId);
    const buyer = await buyersRepository.findById(booking.buyer_id);

    // Calculate queue dynamics
    const activeTokens = await queueRepository.findByMarketId(booking.market_id);
    const waitingTokens = activeTokens.filter(
      (t) => t.status === 'WAITING' || t.status === 'CALLED'
    );
    const mySequence = token?.sequence_number || 142;
    const lotsAhead = waitingTokens.filter((t) => (t.sequence_number || 0) < mySequence).length;

    const estimate = calculateQueueEstimate({
      lotsAhead: booking.departure_state === 'ARRIVED' ? 0 : lotsAhead,
      avgMinutesPerLot: 12,
      activeCounters: buyer?.counter_id ? 4 : 4,
      delayMinutes: booking.delay_minutes,
      travelEtaMinutes: booking.travel_eta_minutes,
    });

    const departureState =
      booking.departure_state === 'ARRIVED'
        ? 'ARRIVED'
        : estimate.recommendedDepartureState;

    const journeySteps: LiveQueueStateDTO['journeySteps'] = [
      {
        title: 'Booking Confirmed',
        description: `Slot reserved for ${booking.slot_start}`,
        status: 'completed',
      },
      {
        title: 'Farm Standby',
        description:
          departureState === 'WAIT'
            ? 'Waiting for gate clearance'
            : 'Departure clearance granted',
        status: departureState === 'WAIT' ? 'current' : 'completed',
      },
      {
        title: 'Transit to Mandi',
        description: `${booking.travel_eta_minutes} mins via GT Road`,
        status:
          departureState === 'LEAVE_NOW' || departureState === 'GET_READY'
            ? 'current'
            : departureState === 'ARRIVED'
            ? 'completed'
            : 'pending',
      },
      {
        title: 'Gate & Unloading',
        description: `${buyer?.mandi_gate || 'Gate 2 Express'} check-in`,
        status: departureState === 'ARRIVED' ? 'current' : 'pending',
      },
      {
        title: 'Grading & Scale',
        description: 'Physical inspection & weighbridge',
        status: 'pending',
      },
      {
        title: 'Direct Benefit Transfer',
        description: 'Instant settlement to bank',
        status: 'pending',
      },
    ];

    let gateNotice = undefined;
    if (booking.delay_minutes > 0) {
      gateNotice = {
        time: 'Just now',
        message: `Mandi Operator added +${booking.delay_minutes} min gate delay. Please remain at farm.`,
      };
    } else if (departureState === 'LEAVE_NOW') {
      gateNotice = {
        time: 'Just now',
        message: 'Gate cleared! Please proceed to Gate 2 Express Line now.',
      };
    }

    return {
      bookingId,
      tokenNumber: booking.token || token?.token || 'MKT-B-142',
      counterId: buyer?.counter_id || 'Counter 4',
      gateName: buyer?.mandi_gate || 'Gate 2 Express Line',
      lotsAhead: booking.departure_state === 'ARRIVED' ? 0 : lotsAhead,
      activeCounters: 4,
      delayMinutes: booking.delay_minutes,
      estimatedWaitMinutes: estimate.totalEstimatedWaitMinutes,
      departureState,
      departureRecommendationText: estimate.departureRecommendationText,
      revisedDepartureTime:
        departureState === 'LEAVE_NOW'
          ? 'NOW'
          : departureState === 'ARRIVED'
          ? 'ARRIVED'
          : booking.recommended_departure_time || '3:15 PM',
      revisedProcessingTime: booking.revised_processing_time || booking.slot_start,
      gateNotice,
      journeySteps,
    };
  }

  async applyDelay(bookingId: string, minutes: number, buyerId: string): Promise<LiveQueueStateDTO> {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');

    const newDelay = booking.delay_minutes + minutes;
    await bookingsRepository.update(bookingId, {
      delay_minutes: newDelay,
      departure_state: 'WAIT',
      recommended_departure_time: '3:45 PM',
    });

    await queueRepository.logQueueEvent(
      bookingId,
      'DELAY_ADDED',
      booking.departure_state,
      'WAIT',
      minutes,
      `Operator added +${minutes}m gate delay`
    );

    emitQueueDelayEvent(booking.market_id, newDelay);
    emitQueueStateChanged(bookingId, 'WAIT', newDelay);

    // Notify farmer
    const lot = await lotsRepository.findById(booking.lot_id);
    if (lot) {
      const farmer = await farmersRepository.findById(lot.farmer_id);
      if (farmer) {
        await notificationsRepository.create({
          user_id: farmer.profile_id,
          role: 'FARMER',
          category: 'QUEUE',
          title: `Gate Delay (+${minutes} min)`,
          message: `Taraori Mandi queue delayed by ${minutes} minutes. Please remain at farm. Revised departure ETA adjusted.`,
          action_route: 'LiveMandiQueue',
          read: false,
        });
      }
    }

    await auditLogsRepository.log(buyerId, 'APPLY_DELAY', 'bookings', bookingId, { minutes });
    return this.getQueueState(bookingId);
  }

  async clearDelay(bookingId: string, buyerId: string): Promise<LiveQueueStateDTO> {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');

    await bookingsRepository.update(bookingId, {
      delay_minutes: 0,
      departure_state: 'LEAVE_NOW',
      recommended_departure_time: 'NOW',
    });

    await queueRepository.logQueueEvent(
      bookingId,
      'DELAY_CLEARED',
      booking.departure_state,
      'LEAVE_NOW',
      0,
      'Gate congestion cleared'
    );

    emitQueueStateChanged(bookingId, 'LEAVE_NOW', 0);

    // Notify farmer
    const lot = await lotsRepository.findById(booking.lot_id);
    if (lot) {
      const farmer = await farmersRepository.findById(lot.farmer_id);
      if (farmer) {
        await notificationsRepository.create({
          user_id: farmer.profile_id,
          role: 'FARMER',
          category: 'QUEUE',
          title: 'Leave for Mandi Now!',
          message: 'Gate congestion cleared. Proceed to Gate 2 Express Line immediately.',
          action_route: 'LiveMandiQueue',
          read: false,
        });
      }
    }

    await auditLogsRepository.log(buyerId, 'CLEAR_DELAY', 'bookings', bookingId);
    return this.getQueueState(bookingId);
  }

  async setDepartureState(bookingId: string, state: DepartureState): Promise<LiveQueueStateDTO> {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');

    await bookingsRepository.update(bookingId, { departure_state: state });
    emitQueueStateChanged(bookingId, state, 0);
    return this.getQueueState(bookingId);
  }

  async checkInFarmer(bookingId: string, farmerId: string): Promise<LiveQueueStateDTO> {
    const booking = await bookingsRepository.findById(bookingId);
    if (!booking) throw new NotFoundError('Booking not found');

    await bookingsRepository.update(bookingId, {
      status: 'CHECKED_IN',
      departure_state: 'ARRIVED',
    });

    await lotsRepository.update(booking.lot_id, { status: 'GATE_CHECKED_IN' });
    await queueRepository.updateStatus(bookingId, 'CHECKED_IN');

    // Notify buyer
    const buyer = await buyersRepository.findById(booking.buyer_id);
    if (buyer) {
      await notificationsRepository.create({
        user_id: buyer.profile_id,
        role: 'BUYER',
        category: 'QUEUE',
        title: 'Farmer Checked In at Gate',
        message: `Token #${booking.token || 'MKT-B-142'} has checked in at gate. Bay 3 ready for physical inspection.`,
        action_route: 'QueueControlPanel',
        read: false,
      });
    }

    await auditLogsRepository.log(farmerId, 'CHECK_IN', 'bookings', bookingId);
    return this.getQueueState(bookingId);
  }

  async advanceQueue(bookingId: string, buyerId: string): Promise<LiveQueueStateDTO> {
    await queueRepository.logQueueEvent(bookingId, 'QUEUE_ADVANCED', undefined, undefined, 0, 'Lot completed');
    await auditLogsRepository.log(buyerId, 'ADVANCE_QUEUE', 'bookings', bookingId);
    return this.getQueueState(bookingId);
  }
}

export const queueService = new QueueService();
