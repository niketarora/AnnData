import { appEvents } from './eventEmitter.js';
import { Transaction } from '../types/index.js';

export const TRANSACTION_EVENTS = {
  CREATED: 'transaction:created',
  PAYMENT_PENDING: 'transaction:payment_pending',
  PAID: 'transaction:paid',
  FAILED: 'transaction:failed',
};

export function emitTransactionEvent(event: string, transaction: Transaction): void {
  appEvents.emitEvent(event, {
    transactionId: transaction.id,
    bookingId: transaction.booking_id,
    farmerId: transaction.farmer_id,
    buyerId: transaction.buyer_id,
    amount: transaction.amount,
    paymentStatus: transaction.payment_status,
    timestamp: new Date().toISOString(),
  });
}
