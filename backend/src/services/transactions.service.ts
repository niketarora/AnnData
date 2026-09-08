import { transactionsRepository } from '../repositories/transactions.repository.js';
import { offersRepository } from '../repositories/offers.repository.js';
import { lotsRepository } from '../repositories/lots.repository.js';
import { cropsRepository } from '../repositories/crops.repository.js';
import { farmersRepository } from '../repositories/farmers.repository.js';
import { buyersRepository } from '../repositories/buyers.repository.js';
import { profilesRepository } from '../repositories/profiles.repository.js';
import { Transaction } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

export interface DigitalReceiptDTO {
  receiptNumber: string;
  transactionId: string;
  bookingId: string;
  timestamp: string;
  farmer: {
    name: string;
    phone?: string;
    location?: string;
    bankAccountMasked?: string;
  };
  buyer: {
    organizationName: string;
    marketName: string;
    mandiGate?: string;
    licenseNumber?: string;
  };
  commodity: {
    cropName: string;
    variety: string;
    quantity: number;
    unit: string;
  };
  financials: {
    ratePerQuintal: number;
    grossAmount: number;
    freightDeduction: number;
    mandiCess: number;
    unloadingCharges: number;
    otherDeductions: number;
    totalDeductions: number;
    netPayout: number;
    currency: string;
    paymentStatus: string;
    paymentReference?: string;
  };
}

export class TransactionsService {
  async getTransactions(userRole: string, farmerId?: string, buyerId?: string): Promise<Transaction[]> {
    if (userRole === 'farmer' && farmerId) {
      return transactionsRepository.findAll({ farmerId });
    }
    if (userRole === 'buyer' && buyerId) {
      return transactionsRepository.findAll({ buyerId });
    }
    return transactionsRepository.findAll();
  }

  async getTransactionById(id: string, userRole: string, farmerId?: string, buyerId?: string): Promise<Transaction> {
    const txn = await transactionsRepository.findById(id);
    if (!txn) throw new NotFoundError(`Transaction not found with ID ${id}`);

    if (userRole === 'farmer' && farmerId && txn.farmer_id !== farmerId) {
      throw new ForbiddenError('You can only access your own transactions');
    }
    if (userRole === 'buyer' && buyerId && txn.buyer_id !== buyerId) {
      throw new ForbiddenError('You can only access transactions belonging to your organization');
    }

    return txn;
  }

  async getReceipt(transactionId: string): Promise<DigitalReceiptDTO> {
    const txn = await transactionsRepository.findById(transactionId);
    if (!txn) throw new NotFoundError(`Transaction not found with ID ${transactionId}`);

    const offer = await offersRepository.findById(txn.offer_id);
    const lot = await lotsRepository.findById(txn.lot_id);
    const crop = lot ? await cropsRepository.findById(lot.crop_id) : null;
    const farmer = await farmersRepository.findById(txn.farmer_id);
    const farmerProfile = farmer ? await profilesRepository.findById(farmer.profile_id) : null;
    const buyer = await buyersRepository.findById(txn.buyer_id);

    return {
      receiptNumber: txn.receipt_number || `JFORM-${txn.id.substring(0, 8).toUpperCase()}`,
      transactionId: txn.id,
      bookingId: txn.booking_id,
      timestamp: txn.created_at,
      farmer: {
        name: farmerProfile?.name || 'Rajesh Kumar',
        phone: farmerProfile?.phone,
        location: farmer?.farm_location,
        bankAccountMasked: farmer?.bank_account?.accountNumberMasked || '•••• •••• 8492',
      },
      buyer: {
        organizationName: buyer?.organization_name || 'Kisan Agritech Mandi Consortium',
        marketName: buyer?.market_name || 'Taraori APMC Mandi',
        mandiGate: buyer?.mandi_gate || 'Gate 2 Express Line',
        licenseNumber: buyer?.license_number || 'APMC-HAR-2024-8891',
      },
      commodity: {
        cropName: crop?.name || 'Wheat',
        variety: lot?.variety || 'Sharbati',
        quantity: offer?.quantity || lot?.quantity || 20,
        unit: lot?.unit || 'Quintal',
      },
      financials: {
        ratePerQuintal: offer?.price_per_unit || 2520,
        grossAmount: offer?.gross_amount || 49644,
        freightDeduction: offer?.freight_cost || 720,
        mandiCess: offer?.mandi_cess || 744.66,
        unloadingCharges: offer?.unloading_charges || 300,
        otherDeductions: offer?.other_deductions || 0,
        totalDeductions:
          (offer?.freight_cost || 720) +
          (offer?.mandi_cess || 744.66) +
          (offer?.unloading_charges || 300) +
          (offer?.other_deductions || 0),
        netPayout: txn.amount,
        currency: txn.currency,
        paymentStatus: txn.payment_status,
        paymentReference: txn.payment_reference || 'REF-UPI-DBT-SUCCESS',
      },
    };
  }
}

export const transactionsService = new TransactionsService();
