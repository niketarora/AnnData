import { Offer } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService } from '../config/supabase.js';

export class OffersRepository {
  async findByBookingId(bookingId: string): Promise<Offer | null> {
    try {
      const { data, error } = await supabaseService
        .from('offers')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) return data as Offer;
    } catch {
      // Fallback
    }
    return memoryDb.offers.find((o) => o.booking_id === bookingId) || null;
  }

  async findById(id: string): Promise<Offer | null> {
    try {
      const { data, error } = await supabaseService.from('offers').select('*').eq('id', id).single();
      if (!error && data) return data as Offer;
    } catch {
      // Fallback
    }
    return memoryDb.offers.find((o) => o.id === id) || null;
  }

  async create(offer: Omit<Offer, 'id' | 'created_at' | 'updated_at'>): Promise<Offer> {
    const id = `off-${Date.now()}`;
    const now = new Date().toISOString();
    const newOffer: Offer = {
      ...offer,
      id,
      created_at: now,
      updated_at: now,
    };

    try {
      const { data, error } = await supabaseService.from('offers').insert(newOffer).select().single();
      if (!error && data) return data as Offer;
    } catch {
      // Fallback
    }

    memoryDb.offers.unshift(newOffer);
    return newOffer;
  }

  async updateStatus(id: string, status: Offer['status']): Promise<Offer | null> {
    try {
      const { data, error } = await supabaseService
        .from('offers')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Offer;
    } catch {
      // Fallback
    }

    const item = memoryDb.offers.find((o) => o.id === id);
    if (!item) return null;
    item.status = status;
    item.updated_at = new Date().toISOString();
    return item;
  }

  async logOfferEvent(offerId: string, action: string, actorId?: string, note?: string): Promise<void> {
    try {
      await supabaseService.from('offer_events').insert({
        offer_id: offerId,
        action,
        actor_id: actorId,
        note,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Fallback
    }
  }
}

export const offersRepository = new OffersRepository();
