import { ITransactionService } from '../interfaces/ITransactionService';
import { Transaction, DigitalReceipt } from '../../types';
import { mockStore } from '../../store';

export class TransactionMockService implements ITransactionService {
  async getTransactions(_userId?: string): Promise<Transaction[]> {
    return mockStore.getState().transactions;
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    return mockStore.getState().transactions.find((t) => t.id === id);
  }

  async getReceiptByTransaction(transactionId: string): Promise<DigitalReceipt | undefined> {
    const txn = await this.getTransactionById(transactionId);
    return txn?.receipt;
  }

  async releasePayment(transactionId: string): Promise<Transaction> {
    mockStore.releasePayment();
    const txn = await this.getTransactionById(transactionId);
    return txn!;
  }
}

export const transactionMockService = new TransactionMockService();
