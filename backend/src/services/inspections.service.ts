import { inspectionsRepository } from '../repositories/inspections.repository.js';
import { lotsRepository } from '../repositories/lots.repository.js';
import { bookingsRepository } from '../repositories/bookings.repository.js';
import { notificationsRepository } from '../repositories/notifications.repository.js';
import { farmersRepository } from '../repositories/farmers.repository.js';
import { auditLogsRepository } from '../repositories/auditLogs.repository.js';
import { Inspection } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export class InspectionsService {
  async getInspectionByBooking(bookingId: string): Promise<Inspection | null> {
    return inspectionsRepository.findByBookingId(bookingId);
  }

  async submitPhysicalInspection(
    buyerId: string,
    payload: {
      booking_id: string;
      lot_id: string;
      physical_grade: string;
      quality_score: number;
      moisture?: number;
      defects?: number;
      foreign_matter?: number;
      notes?: string;
    }
  ): Promise<Inspection> {
    const booking = await bookingsRepository.findById(payload.booking_id);
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.buyer_id !== buyerId) throw new ForbiddenError('Only the assigned buyer can inspect this lot');

    const lot = await lotsRepository.findById(payload.lot_id);
    if (!lot) throw new NotFoundError('Crop lot not found');

    // Retain preliminary AI grade independently
    const inspection = await inspectionsRepository.create({
      ...payload,
      ai_grade: lot.preliminary_grade || 'Grade A',
      verified_by: buyerId,
      verified_at: new Date().toISOString(),
    });

    await lotsRepository.update(payload.lot_id, {
      status: 'PHYSICALLY_INSPECTED',
    });

    // Notify farmer
    const farmer = await farmersRepository.findById(lot.farmer_id);
    if (farmer) {
      await notificationsRepository.create({
        user_id: farmer.profile_id,
        role: 'FARMER',
        category: 'SYSTEM',
        title: 'Quality Verification Completed',
        message: `Physical grading verified ${payload.physical_grade} (${payload.quality_score}/100, ${payload.moisture || 11.8}% moisture). Proceeding to weighbridge.`,
        action_route: 'PhysicalInspectionResult',
        read: false,
      });
    }

    await auditLogsRepository.log(buyerId, 'RECORD_INSPECTION', 'inspections', inspection.id, {
      grade: payload.physical_grade,
      score: payload.quality_score,
    });

    return inspection;
  }
}

export const inspectionsService = new InspectionsService();
