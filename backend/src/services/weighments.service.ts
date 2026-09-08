import { weighmentsRepository } from '../repositories/weighments.repository.js';
import { lotsRepository } from '../repositories/lots.repository.js';
import { bookingsRepository } from '../repositories/bookings.repository.js';
import { notificationsRepository } from '../repositories/notifications.repository.js';
import { farmersRepository } from '../repositories/farmers.repository.js';
import { auditLogsRepository } from '../repositories/auditLogs.repository.js';
import { roundToTwoDecimals } from '../utils/currency.js';
import { Weighment } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class WeighmentsService {
  async getWeighmentByBooking(bookingId: string): Promise<Weighment | null> {
    return weighmentsRepository.findByBookingId(bookingId);
  }

  async recordWeighment(
    buyerId: string,
    payload: {
      booking_id: string;
      lot_id: string;
      expected_quantity: number;
      gross_weight?: number;
      tare_weight?: number;
      actual_quantity: number;
      unit?: string;
      notes?: string;
    }
  ): Promise<Weighment> {
    const booking = await bookingsRepository.findById(payload.booking_id);
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.buyer_id !== buyerId) throw new ForbiddenError('Only the assigned buyer can record weighment');

    const lot = await lotsRepository.findById(payload.lot_id);
    if (!lot) throw new NotFoundError('Crop lot not found');

    const diff = roundToTwoDecimals(payload.actual_quantity - payload.expected_quantity);

    const weighment = await weighmentsRepository.create({
      booking_id: payload.booking_id,
      lot_id: payload.lot_id,
      expected_quantity: payload.expected_quantity,
      gross_weight: payload.gross_weight,
      tare_weight: payload.tare_weight,
      actual_quantity: payload.actual_quantity,
      unit: payload.unit || 'Quintal',
      difference: diff,
      verified_by: buyerId,
      verified_at: new Date().toISOString(),
      notes: payload.notes,
    });

    await lotsRepository.update(payload.lot_id, {
      status: 'WEIGHED',
      quantity: payload.actual_quantity, // Authoritative verified actual quantity
    });

    // Notify farmer
    const farmer = await farmersRepository.findById(lot.farmer_id);
    if (farmer) {
      await notificationsRepository.create({
        user_id: farmer.profile_id,
        role: 'FARMER',
        category: 'SYSTEM',
        title: 'Scale Weighment Verified',
        message: `Scale gross: ${payload.gross_weight || 5420} kg • Tare: ${payload.tare_weight || 3450} kg • Final Net Weight: ${payload.actual_quantity} Quintals verified.`,
        action_route: 'WeighmentResult',
        read: false,
      });
    }

    await auditLogsRepository.log(buyerId, 'RECORD_WEIGHMENT', 'weighments', weighment.id, {
      actualQuantity: payload.actual_quantity,
      difference: diff,
    });

    return weighment;
  }
}

export const weighmentsService = new WeighmentsService();
