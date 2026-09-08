import { Weighment } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService, isSupabaseConfigured } from '../config/supabase.js';

export class WeighmentsRepository {
  async findByBookingId(bookingId: string): Promise<Weighment | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('weighments')
          .select('*')
          .eq('booking_id', bookingId)
          .single();
        if (!error && data) return data as Weighment;
      } catch {
        // Fallback
      }
    }
    return memoryDb.weighments.find((w) => w.booking_id === bookingId) || null;
  }

  async create(weighment: Omit<Weighment, 'id' | 'created_at'>): Promise<Weighment> {
    const newWeighment: Weighment = {
      ...weighment,
      id: `wgh-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('weighments')
          .insert(newWeighment)
          .select()
          .single();
        if (!error && data) return data as Weighment;
      } catch {
        // Fallback
      }
    }

    memoryDb.weighments.push(newWeighment);
    return newWeighment;
  }
}

export const weighmentsRepository = new WeighmentsRepository();
