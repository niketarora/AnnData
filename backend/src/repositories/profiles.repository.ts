import { Profile } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService, isSupabaseConfigured } from '../config/supabase.js';

export class ProfilesRepository {
  async findById(id: string): Promise<Profile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('profiles').select('*').eq('id', id).single();
        if (!error && data) return data as Profile;
      } catch {
        // Fallback
      }
    }
    return memoryDb.profiles.find((p) => p.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Profile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('profiles').select('*').eq('user_id', userId).single();
        if (!error && data) return data as Profile;
      } catch {
        // Fallback
      }
    }
    return memoryDb.profiles.find((p) => p.user_id === userId) || null;
  }

  async update(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as Profile;
      } catch {
        // Fallback
      }
    }
    const profile = memoryDb.profiles.find((p) => p.id === id);
    if (!profile) return null;
    Object.assign(profile, updates, { updated_at: new Date().toISOString() });
    return profile;
  }
}

export const profilesRepository = new ProfilesRepository();
