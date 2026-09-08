import { Inspection } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService } from '../config/supabase.js';

export class InspectionsRepository {
  async findByBookingId(bookingId: string): Promise<Inspection | null> {
    try {
      const { data, error } = await supabaseService
        .from('inspections')
        .select('*')
        .eq('booking_id', bookingId)
        .single();
      if (!error && data) return data as Inspection;
    } catch {
      // Fallback
    }
    return memoryDb.inspections.find((i) => i.booking_id === bookingId) || null;
  }

  async create(inspection: Omit<Inspection, 'id' | 'created_at'>): Promise<Inspection> {
    const newInspection: Inspection = {
      ...inspection,
      id: `insp-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabaseService
        .from('inspections')
        .insert(newInspection)
        .select()
        .single();
      if (!error && data) return data as Inspection;
    } catch {
      // Fallback
    }

    memoryDb.inspections.push(newInspection);
    return newInspection;
  }
}

export const inspectionsRepository = new InspectionsRepository();
