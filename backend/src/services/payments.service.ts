import { paymentsRepository } from '../repositories/payments.repository.js';
import { transactionsRepository } from '../repositories/transactions.repository.js';
import { lotsRepository } from '../repositories/lots.repository.js';
import { notificationsRepository } from '../repositories/notifications.repository.js';
import { farmersRepository } from '../repositories/farmers.repository.js';
import { auditLogsRepository } from '../repositories/auditLogs.repository.js';
import { defaultPaymentGateway } from '../integrations/paymentGateway.interface.js';
import { Payment, Transaction } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { emitTransactionEvent, TRANSACTION_EVENTS } from '../events/transaction.events.js';

export class PaymentsService {
  async getPaymentByTransaction(transactionId: string): Promise<Payment | null> {
    return paymentsRepository.findByTransactionId(transactionId);
  }

  async releasePayment(transactionId: string, buyerId: string): Promise<Transaction> {
    const txn = await transactionsRepository.findById(transactionId);
    if (!txn) throw new NotFoundError('Transaction not found');
    if (txn.buyer_id !== buyerId) throw new ForbiddenError('Only the buyer can release payment for this transaction');

    // Call payment provider interface (Mock in Dev, Razorpay/UPI in Prod)
    const providerResult = await defaultPaymentGateway.initiatePayment({
      transactionId,
      amount: txn.amount,
      currency: txn.currency,
    });

    const payment = await paymentsRepository.updateStatus(
      transactionId,
      'PAID',
      providerResult.providerReference
    );

    const updatedTxn = (await transactionsRepository.updatePaymentStatus(
      transactionId,
      'PAID',
      providerResult.providerReference
    ))!;

    await lotsRepository.update(txn.lot_id, { status: 'PAID' });
    emitTransactionEvent(TRANSACTION_EVENTS.PAID, updatedTxn);

    // Notify farmer of DBT credit
    const farmer = await farmersRepository.findById(txn.farmer_id);
    if (farmer) {
      await notificationsRepository.create({
        user_id: farmer.profile_id,
        role: 'FARMER',
        category: 'PAYMENT',
        title: `Payment Credited ₹${txn.amount.toLocaleString('en-IN')}`,
        message: `Direct Benefit Transfer completed via UPI to your State Bank of India account. J-Form digital receipt issued.`,
        action_route: 'PaymentStatus',
        read: false,
      });
    }

    await auditLogsRepository.log(buyerId, 'RELEASE_PAYMENT', 'payments', payment?.id || transactionId, {
      amount: txn.amount,
      ref: providerResult.providerReference,
    });

    return updatedTxn;
  }
}

export const paymentsService = new PaymentsService();
