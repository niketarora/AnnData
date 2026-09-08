import { offersRepository } from '../repositories/offers.repository.js';
import { bookingsRepository } from '../repositories/bookings.repository.js';
import { lotsRepository } from '../repositories/lots.repository.js';
import { transactionsRepository } from '../repositories/transactions.repository.js';
import { paymentsRepository } from '../repositories/payments.repository.js';
import { notificationsRepository } from '../repositories/notifications.repository.js';
import { farmersRepository } from '../repositories/farmers.repository.js';
import { buyersRepository } from '../repositories/buyers.repository.js';
import { auditLogsRepository } from '../repositories/auditLogs.repository.js';
import { roundToTwoDecimals } from '../utils/currency.js';
import { Offer, Transaction } from '../types/index.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';
import { emitOfferEvent, OFFER_EVENTS } from '../events/offer.events.js';
import { emitTransactionEvent, TRANSACTION_EVENTS } from '../events/transaction.events.js';

export class OffersService {
  async getOfferByBooking(bookingId: string): Promise<Offer | null> {
    return offersRepository.findByBookingId(bookingId);
  }

  async getOfferById(id: string): Promise<Offer> {
    const offer = await offersRepository.findById(id);
    if (!offer) throw new NotFoundError(`Offer not found with ID ${id}`);
    return offer;
  }

  async createOffer(
    buyerId: string,
    payload: {
      booking_id: string;
      lot_id: string;
      price_per_unit: number;
      quantity: number;
      freight_cost?: number;
      mandi_cess?: number;
      unloading_charges?: number;
      other_deductions?: number;
      notes?: string;
      expires_in_hours?: number;
    }
  ): Promise<Offer> {
    const booking = await bookingsRepository.findById(payload.booking_id);
    if (!booking) throw new NotFoundError('Booking not found');
    if (booking.buyer_id !== buyerId) throw new ForbiddenError('Only the assigned buyer can issue an offer');

    const lot = await lotsRepository.findById(payload.lot_id);
    if (!lot) throw new NotFoundError('Crop lot not found');

    const gross = roundToTwoDecimals(payload.price_per_unit * payload.quantity);
    const freight = roundToTwoDecimals(payload.freight_cost ?? 720);
    const cess = roundToTwoDecimals(payload.mandi_cess ?? (gross * 0.015));
    const unloading = roundToTwoDecimals(payload.unloading_charges ?? 300);
    const other = roundToTwoDecimals(payload.other_deductions ?? 0);
    const totalDeductions = roundToTwoDecimals(freight + cess + unloading + other);
    const net = roundToTwoDecimals(Math.max(0, gross - totalDeductions));

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (payload.expires_in_hours || 24));

    const offer = await offersRepository.create({
      booking_id: payload.booking_id,
      buyer_id: buyerId,
      farmer_id: lot.farmer_id,
      lot_id: payload.lot_id,
      price_per_unit: payload.price_per_unit,
      quantity: payload.quantity,
      gross_amount: gross,
      freight_cost: freight,
      mandi_cess: cess,
      unloading_charges: unloading,
      other_deductions: other,
      net_amount: net,
      expires_at: expiresAt.toISOString(),
      notes: payload.notes,
      status: 'OFFERED',
    });

    await lotsRepository.update(payload.lot_id, { status: 'OFFER_RECEIVED' });
    await offersRepository.logOfferEvent(offer.id, 'OFFER_CREATED', buyerId, `Offer of ₹${net} issued`);
    emitOfferEvent(OFFER_EVENTS.SUBMITTED, offer);

    // Notify farmer
    const farmer = await farmersRepository.findById(lot.farmer_id);
    if (farmer) {
      await notificationsRepository.create({
        user_id: farmer.profile_id,
        role: 'FARMER',
        category: 'OFFER',
        title: 'Buyer Offer Received!',
        message: `Buyer submitted binding offer of ₹${net.toLocaleString('en-IN')} for ${payload.quantity} QTL. Review and accept.`,
        action_route: 'FarmerOfferDecision',
        read: false,
      });
    }

    await auditLogsRepository.log(buyerId, 'CREATE_OFFER', 'offers', offer.id, { netAmount: net });
    return offer;
  }

  async acceptOffer(offerId: string, farmerId: string): Promise<{ offer: Offer; transaction: Transaction }> {
    const offer = await offersRepository.findById(offerId);
    if (!offer) throw new NotFoundError('Offer not found');
    if (offer.farmer_id !== farmerId) throw new ForbiddenError('Only the assigned farmer can accept this offer');

    if (offer.status !== 'OFFERED') {
      throw new ConflictError(`Cannot accept offer with status ${offer.status}`);
    }

    const updatedOffer = (await offersRepository.updateStatus(offerId, 'ACCEPTED'))!;
    await lotsRepository.update(offer.lot_id, { status: 'OFFER_ACCEPTED' });

    // Atomic: Create Transaction & Payment Pending state
    const receiptNum = `JFORM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const transaction = await transactionsRepository.create({
      booking_id: offer.booking_id,
      offer_id: offerId,
      farmer_id: offer.farmer_id,
      buyer_id: offer.buyer_id,
      lot_id: offer.lot_id,
      amount: offer.net_amount,
      currency: 'INR',
      payment_status: 'PAYMENT_PENDING',
      receipt_number: receiptNum,
    });

    await paymentsRepository.create({
      transaction_id: transaction.id,
      amount: offer.net_amount,
      currency: 'INR',
      provider: 'MOCK_DBT_ESCROW',
      provider_reference: `ESCROW-${transaction.id.substring(0, 8)}`,
      status: 'PAYMENT_PENDING',
    });

    await offersRepository.logOfferEvent(offerId, 'ACCEPTED', farmerId, 'Farmer accepted purchase offer');
    emitOfferEvent(OFFER_EVENTS.ACCEPTED, updatedOffer);
    emitTransactionEvent(TRANSACTION_EVENTS.PAYMENT_PENDING, transaction);

    // Notify buyer
    const buyer = await buyersRepository.findById(offer.buyer_id);
    if (buyer) {
      await notificationsRepository.create({
        user_id: buyer.profile_id,
        role: 'BUYER',
        category: 'OFFER',
        title: 'Offer Accepted by Farmer',
        message: `Farmer accepted ₹${offer.net_amount.toLocaleString('en-IN')} offer. Escrow ready for release.`,
        action_route: 'BuyerTransactions',
        read: false,
      });
    }

    await auditLogsRepository.log(farmerId, 'ACCEPT_OFFER', 'offers', offerId, { transactionId: transaction.id });
    return { offer: updatedOffer, transaction };
  }

  async rejectOffer(offerId: string, farmerId: string, reason?: string): Promise<Offer> {
    const offer = await offersRepository.findById(offerId);
    if (!offer) throw new NotFoundError('Offer not found');
    if (offer.farmer_id !== farmerId) throw new ForbiddenError('Only the assigned farmer can reject this offer');

    const updatedOffer = (await offersRepository.updateStatus(offerId, 'REJECTED'))!;
    await lotsRepository.update(offer.lot_id, { status: 'REJECTED' });

    await offersRepository.logOfferEvent(offerId, 'REJECTED', farmerId, reason || 'Farmer rejected offer');
    emitOfferEvent(OFFER_EVENTS.REJECTED, updatedOffer);

    // Notify buyer
    const buyer = await buyersRepository.findById(offer.buyer_id);
    if (buyer) {
      await notificationsRepository.create({
        user_id: buyer.profile_id,
        role: 'BUYER',
        category: 'OFFER',
        title: 'Offer Rejected',
        message: 'Farmer declined purchase offer. Counter negotiations may be opened.',
        action_route: 'BuyerTransactions',
        read: false,
      });
    }

    await auditLogsRepository.log(farmerId, 'REJECT_OFFER', 'offers', offerId, { reason });
    return updatedOffer;
  }
}

export const offersService = new OffersService();
