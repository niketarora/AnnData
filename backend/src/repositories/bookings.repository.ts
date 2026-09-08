import { Booking } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService, isSupabaseConfigured } from '../config/supabase.js';

export class BookingsRepository {
  async findAll(filters?: { farmerId?: string; buyerId?: string; status?: string }): Promise<Booking[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabaseService.from('bookings').select('*');
        if (filters?.buyerId) query = query.eq('buyer_id', filters.buyerId);
        if (filters?.status) query = query.eq('status', filters.status);
        const { data, error } = await query;
        if (!error && data) return data as Booking[];
      } catch {
        // Fallback
      }
    }

    return memoryDb.bookings.filter((b) => {
      if (filters?.buyerId && b.buyer_id !== filters.buyerId) return false;
      if (filters?.status && b.status !== filters.status) return false;
      if (filters?.farmerId) {
        const lot = memoryDb.cropLots.find((l) => l.id === b.lot_id);
        if (!lot || lot.farmer_id !== filters.farmerId) return false;
      }
      return true;
    });
  }

  async findById(id: string): Promise<Booking | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('bookings').select('*').eq('id', id).single();
        if (!error && data) return data as Booking;
      } catch {
        // Fallback
      }
    }
    return memoryDb.bookings.find((b) => b.id === id) || null;
  }

  async create(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
    const id = `book-${Date.now()}`;
    const now = new Date().toISOString();
    const newBooking: Booking = {
      ...booking,
      id,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('bookings').insert(newBooking).select().single();
        if (!error && data) return data as Booking;
      } catch {
        // Fallback
      }
    }

    memoryDb.bookings.unshift(newBooking);
    return newBooking;
  }

  async update(id: string, updates: Partial<Booking>): Promise<Booking | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('bookings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Booking;
      } catch {
        // Fallback
      }
    }

    const item = memoryDb.bookings.find((b) => b.id === id);
    if (!item) return null;
    Object.assign(item, updates, { updated_at: new Date().toISOString() });
    return item;
  }
}

export const bookingsRepository = new BookingsRepository();
