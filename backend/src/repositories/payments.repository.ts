import { Payment } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService } from '../config/supabase.js';

export class PaymentsRepository {
  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabaseService
        .from('payments')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();
      if (!error && data) return data as Payment;
    } catch {
      // Fallback
    }
    return memoryDb.payments.find((p) => p.transaction_id === transactionId) || null;
  }

  async create(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabaseService.from('payments').insert(newPayment).select().single();
      if (!error && data) return data as Payment;
    } catch {
      // Fallback
    }

    memoryDb.payments.push(newPayment);
    return newPayment;
  }

  async updateStatus(transactionId: string, status: Payment['status'], ref?: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabaseService
        .from('payments')
        .update({
          status,
          provider_reference: ref,
          completed_at: status === 'PAID' ? new Date().toISOString() : undefined,
        })
        .eq('transaction_id', transactionId)
        .select()
        .single();
      if (!error && data) return data as Payment;
    } catch {
      // Fallback
    }

    const item = memoryDb.payments.find((p) => p.transaction_id === transactionId);
    if (!item) return null;
    item.status = status;
    if (ref) item.provider_reference = ref;
    if (status === 'PAID') item.completed_at = new Date().toISOString();
    return item;
  }
}

export const paymentsRepository = new PaymentsRepository();
