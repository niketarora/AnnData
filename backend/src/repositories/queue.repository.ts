import { QueueToken } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService } from '../config/supabase.js';

export class QueueRepository {
  async findByBookingId(bookingId: string): Promise<QueueToken | null> {
    try {
      const { data, error } = await supabaseService
        .from('queue_tokens')
        .select('*')
        .eq('booking_id', bookingId)
        .single();
      if (!error && data) return data as QueueToken;
    } catch {
      // Fallback
    }
    return memoryDb.queueTokens.find((q) => q.booking_id === bookingId) || null;
  }

  async findByMarketId(marketId: string): Promise<QueueToken[]> {
    try {
      const { data, error } = await supabaseService
        .from('queue_tokens')
        .select('*')
        .eq('market_id', marketId);
      if (!error && data) return data as QueueToken[];
    } catch {
      // Fallback
    }
    return memoryDb.queueTokens.filter((q) => q.market_id === marketId);
  }

  async createToken(token: Omit<QueueToken, 'id' | 'issued_at'>): Promise<QueueToken> {
    const newToken: QueueToken = {
      ...token,
      id: `tok-${Date.now()}`,
      issued_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabaseService
        .from('queue_tokens')
        .insert(newToken)
        .select()
        .single();
      if (!error && data) return data as QueueToken;
    } catch {
      // Fallback
    }

    memoryDb.queueTokens.push(newToken);
    return newToken;
  }

  async updateStatus(bookingId: string, status: QueueToken['status']): Promise<QueueToken | null> {
    try {
      const { data, error } = await supabaseService
        .from('queue_tokens')
        .update({ status })
        .eq('booking_id', bookingId)
        .select()
        .single();
      if (!error && data) return data as QueueToken;
    } catch {
      // Fallback
    }

    const item = memoryDb.queueTokens.find((q) => q.booking_id === bookingId);
    if (!item) return null;
    item.status = status;
    return item;
  }

  async logQueueEvent(
    bookingId: string,
    eventType: string,
    oldStatus?: string,
    newStatus?: string,
    delayMinutes = 0,
    notes?: string
  ): Promise<void> {
    try {
      await supabaseService.from('queue_events').insert({
        booking_id: bookingId,
        event_type: eventType,
        old_status: oldStatus,
        new_status: newStatus,
        delay_minutes: delayMinutes,
        notes,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Fallback
    }
  }
}

export const queueRepository = new QueueRepository();
