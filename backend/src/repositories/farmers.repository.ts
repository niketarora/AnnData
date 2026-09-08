import { Farmer } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService } from '../config/supabase.js';

export class FarmersRepository {
  async findById(id: string): Promise<Farmer | null> {
    try {
      const { data, error } = await supabaseService.from('farmers').select('*').eq('id', id).single();
      if (!error && data) return data as Farmer;
    } catch {
      // Fallback
    }
    return memoryDb.farmers.find((f) => f.id === id) || null;
  }

  async findByProfileId(profileId: string): Promise<Farmer | null> {
    try {
      const { data, error } = await supabaseService
        .from('farmers')
        .select('*')
        .eq('profile_id', profileId)
        .single();
      if (!error && data) return data as Farmer;
    } catch {
      // Fallback
    }
    return memoryDb.farmers.find((f) => f.profile_id === profileId) || null;
  }

  async update(id: string, updates: Partial<Farmer>): Promise<Farmer | null> {
    try {
      const { data, error } = await supabaseService
        .from('farmers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Farmer;
    } catch {
      // Fallback
    }
    const farmer = memoryDb.farmers.find((f) => f.id === id);
    if (!farmer) return null;
    Object.assign(farmer, updates, { updated_at: new Date().toISOString() });
    return farmer;
  }
}

export const farmersRepository = new FarmersRepository();
