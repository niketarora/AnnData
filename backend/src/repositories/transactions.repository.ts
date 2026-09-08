import { Transaction } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService } from '../config/supabase.js';

export class TransactionsRepository {
  async findAll(filters?: { farmerId?: string; buyerId?: string }): Promise<Transaction[]> {
    try {
      let query = supabaseService.from('transactions').select('*');
      if (filters?.farmerId) query = query.eq('farmer_id', filters.farmerId);
      if (filters?.buyerId) query = query.eq('buyer_id', filters.buyerId);
      const { data, error } = await query;
      if (!error && data) return data as Transaction[];
    } catch {
      // Fallback
    }

    return memoryDb.transactions.filter((t) => {
      if (filters?.farmerId && t.farmer_id !== filters.farmerId) return false;
      if (filters?.buyerId && t.buyer_id !== filters.buyerId) return false;
      return true;
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabaseService.from('transactions').select('*').eq('id', id).single();
      if (!error && data) return data as Transaction;
    } catch {
      // Fallback
    }
    return memoryDb.transactions.find((t) => t.id === id) || null;
  }

  async findByBookingId(bookingId: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabaseService
        .from('transactions')
        .select('*')
        .eq('booking_id', bookingId)
        .single();
      if (!error && data) return data as Transaction;
    } catch {
      // Fallback
    }
    return memoryDb.transactions.find((t) => t.booking_id === bookingId) || null;
  }

  async create(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const id = `txn-${Date.now()}`;
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id,
      created_at: now,
      updated_at: now,
    };

    try {
      const { data, error } = await supabaseService.from('transactions').insert(newTransaction).select().single();
      if (!error && data) return data as Transaction;
    } catch {
      // Fallback
    }

    memoryDb.transactions.unshift(newTransaction);
    return newTransaction;
  }

  async updatePaymentStatus(id: string, paymentStatus: Transaction['payment_status'], paymentRef?: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabaseService
        .from('transactions')
        .update({
          payment_status: paymentStatus,
          payment_reference: paymentRef,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Transaction;
    } catch {
      // Fallback
    }

    const item = memoryDb.transactions.find((t) => t.id === id);
    if (!item) return null;
    item.payment_status = paymentStatus;
    if (paymentRef) item.payment_reference = paymentRef;
    item.updated_at = new Date().toISOString();
    return item;
  }
}

export const transactionsRepository = new TransactionsRepository();
