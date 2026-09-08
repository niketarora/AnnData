import { Transaction, DigitalReceipt } from '../../types';

export interface ITransactionService {
  getTransactions(userId?: string): Promise<Transaction[]>;
  getTransactionById(id: string): Promise<Transaction | undefined>;
  getReceiptByTransaction(transactionId: string): Promise<DigitalReceipt | undefined>;
  releasePayment(transactionId: string): Promise<Transaction>;
}
