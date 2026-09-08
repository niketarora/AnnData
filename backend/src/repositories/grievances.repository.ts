import { Grievance } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService, isSupabaseConfigured } from '../config/supabase.js';

export class GrievancesRepository {
  async findAll(userId?: string): Promise<Grievance[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabaseService.from('grievances').select('*');
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query;
        if (!error && data) return data as Grievance[];
      } catch {
        // Fallback
      }
    }

    return memoryDb.grievances.filter((g) => (!userId ? true : g.user_id === userId));
  }

  async findById(id: string): Promise<Grievance | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('grievances').select('*').eq('id', id).single();
        if (!error && data) return data as Grievance;
      } catch {
        // Fallback
      }
    }
    return memoryDb.grievances.find((g) => g.id === id) || null;
  }

  async create(grievance: Omit<Grievance, 'id' | 'created_at'>): Promise<Grievance> {
    const newGrievance: Grievance = {
      ...grievance,
      id: `grv-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('grievances').insert(newGrievance).select().single();
        if (!error && data) return data as Grievance;
      } catch {
        // Fallback
      }
    }

    memoryDb.grievances.unshift(newGrievance);
    return newGrievance;
  }

  async update(id: string, updates: Partial<Grievance>): Promise<Grievance | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('grievances')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Grievance;
      } catch {
        // Fallback
      }
    }

    const item = memoryDb.grievances.find((g) => g.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    return item;
  }
}

export const grievancesRepository = new GrievancesRepository();
