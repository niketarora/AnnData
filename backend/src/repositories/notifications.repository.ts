import { AppNotification } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService, isSupabaseConfigured } from '../config/supabase.js';

export class NotificationsRepository {
  async findByUserId(userId: string): Promise<AppNotification[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as AppNotification[];
      } catch {
        // Fallback
      }
    }
    return memoryDb.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async create(notification: Omit<AppNotification, 'id' | 'created_at'>): Promise<AppNotification> {
    const newNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('notifications')
          .insert(newNotification)
          .select()
          .single();
        if (!error && data) return data as AppNotification;
      } catch {
        // Fallback
      }
    }

    memoryDb.notifications.unshift(newNotification);
    return newNotification;
  }

  async markAsRead(id: string, userId: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabaseService
          .from('notifications')
          .update({ read: true })
          .eq('id', id)
          .eq('user_id', userId);
      } catch {
        // Fallback
      }
    }

    const notif = memoryDb.notifications.find((n) => n.id === id && n.user_id === userId);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  async markAllAsRead(userId: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabaseService
          .from('notifications')
          .update({ read: true })
          .eq('user_id', userId);
      } catch {
        // Fallback
      }
    }

    for (const notif of memoryDb.notifications) {
      if (notif.user_id === userId) {
        notif.read = true;
      }
    }
  }
}

export const notificationsRepository = new NotificationsRepository();
