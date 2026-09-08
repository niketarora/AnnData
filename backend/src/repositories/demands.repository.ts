import { BuyerDemand } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService, isSupabaseConfigured } from '../config/supabase.js';

export class DemandsRepository {
  async findAll(filters?: { buyerId?: string; cropId?: string; status?: string }): Promise<BuyerDemand[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabaseService.from('buyer_demands').select('*');
        if (filters?.buyerId) query = query.eq('buyer_id', filters.buyerId);
        if (filters?.cropId) query = query.eq('crop_id', filters.cropId);
        if (filters?.status) query = query.eq('status', filters.status);
        const { data, error } = await query;
        if (!error && data) return data as BuyerDemand[];
      } catch {
        // Fallback
      }
    }

    return memoryDb.demands.filter((d) => {
      if (filters?.buyerId && d.buyer_id !== filters.buyerId) return false;
      if (filters?.cropId && d.crop_id !== filters.cropId) return false;
      if (filters?.status && d.status !== filters.status) return false;
      return true;
    });
  }

  async findById(id: string): Promise<BuyerDemand | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('buyer_demands').select('*').eq('id', id).single();
        if (!error && data) return data as unknown as BuyerDemand;
      } catch {
        // Fallback
      }
    }
    return memoryDb.demands.find((d) => d.id === id) || null;
  }

  async create(demand: Omit<BuyerDemand, 'id' | 'created_at' | 'updated_at'>): Promise<BuyerDemand> {
    const id = `dem-${Date.now()}`;
    const now = new Date().toISOString();
    const newDemand: BuyerDemand = {
      ...demand,
      id,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('buyer_demands')
          .insert(newDemand)
          .select()
          .single();
        if (!error && data) return data as BuyerDemand;
      } catch {
        // Fallback
      }
    }

    memoryDb.demands.unshift(newDemand);
    return newDemand;
  }

  async update(id: string, updates: Partial<BuyerDemand>): Promise<BuyerDemand | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('buyer_demands')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as BuyerDemand;
      } catch {
        // Fallback
      }
    }

    const item = memoryDb.demands.find((d) => d.id === id);
    if (!item) return null;
    Object.assign(item, updates, { updated_at: new Date().toISOString() });
    return item;
  }

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabaseService.from('buyer_demands').delete().eq('id', id);
      } catch {
        // Fallback
      }
    }
    const idx = memoryDb.demands.findIndex((d) => d.id === id);
    if (idx !== -1) {
      memoryDb.demands.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export const demandsRepository = new DemandsRepository();
