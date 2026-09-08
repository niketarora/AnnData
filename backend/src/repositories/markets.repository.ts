import { Market } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService } from '../config/supabase.js';

export class MarketsRepository {
  async findAll(): Promise<Market[]> {
    try {
      const { data, error } = await supabaseService.from('markets').select('*').eq('active', true);
      if (!error && data) return data as Market[];
    } catch {
      // Fallback
    }
    return memoryDb.markets.filter((m) => m.active);
  }

  async findById(id: string): Promise<Market | null> {
    try {
      const { data, error } = await supabaseService.from('markets').select('*').eq('id', id).single();
      if (!error && data) return data as Market;
    } catch {
      // Fallback
    }
    return memoryDb.markets.find((m) => m.id === id) || null;
  }
}

export const marketsRepository = new MarketsRepository();
