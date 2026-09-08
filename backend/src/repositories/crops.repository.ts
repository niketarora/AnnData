import { Crop } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService, isSupabaseConfigured } from '../config/supabase.js';

export class CropsRepository {
  async findAll(): Promise<Crop[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('crops').select('*').eq('active', true);
        if (!error && data) return data as Crop[];
      } catch {
        // Fallback
      }
    }
    return memoryDb.crops.filter((c) => c.active);
  }

  async findById(id: string): Promise<Crop | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('crops').select('*').eq('id', id).single();
        if (!error && data) return data as Crop;
      } catch {
        // Fallback
      }
    }
    return memoryDb.crops.find((c) => c.id === id) || null;
  }
}

export const cropsRepository = new CropsRepository();
