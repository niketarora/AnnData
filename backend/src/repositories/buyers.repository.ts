import { Buyer } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService } from '../config/supabase.js';

export class BuyersRepository {
  async findById(id: string): Promise<Buyer | null> {
    try {
      const { data, error } = await supabaseService.from('buyers').select('*').eq('id', id).single();
      if (!error && data) return data as Buyer;
    } catch {
      // Fallback
    }
    return memoryDb.buyers.find((b) => b.id === id) || null;
  }

  async findByProfileId(profileId: string): Promise<Buyer | null> {
    try {
      const { data, error } = await supabaseService
        .from('buyers')
        .select('*')
        .eq('profile_id', profileId)
        .single();
      if (!error && data) return data as Buyer;
    } catch {
      // Fallback
    }
    return memoryDb.buyers.find((b) => b.profile_id === profileId) || null;
  }

  async findAll(): Promise<Buyer[]> {
    try {
      const { data, error } = await supabaseService.from('buyers').select('*');
      if (!error && data) return data as Buyer[];
    } catch {
      // Fallback
    }
    return memoryDb.buyers;
  }

  async update(id: string, updates: Partial<Buyer>): Promise<Buyer | null> {
    try {
      const { data, error } = await supabaseService
        .from('buyers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Buyer;
    } catch {
      // Fallback
    }
    const buyer = memoryDb.buyers.find((b) => b.id === id);
    if (!buyer) return null;
    Object.assign(buyer, updates, { updated_at: new Date().toISOString() });
    return buyer;
  }
}

export const buyersRepository = new BuyersRepository();
