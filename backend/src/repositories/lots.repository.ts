import { CropLot, LotImage } from '../types/index.js';
import { memoryDb } from './dbStore.js';
import { supabaseService } from '../config/supabase.js';

export class LotsRepository {
  async findAll(filters?: { farmerId?: string; status?: string }): Promise<CropLot[]> {
    try {
      let query = supabaseService.from('crop_lots').select('*');
      if (filters?.farmerId) query = query.eq('farmer_id', filters.farmerId);
      if (filters?.status) query = query.eq('status', filters.status);
      const { data, error } = await query;
      if (!error && data) return data as CropLot[];
    } catch {
      // Fallback
    }

    return memoryDb.cropLots.filter((lot) => {
      if (filters?.farmerId && lot.farmer_id !== filters.farmerId) return false;
      if (filters?.status && lot.status !== filters.status) return false;
      return true;
    });
  }

  async findById(id: string): Promise<CropLot | null> {
    try {
      const { data, error } = await supabaseService.from('crop_lots').select('*').eq('id', id).single();
      if (!error && data) return data as CropLot;
    } catch {
      // Fallback
    }
    return memoryDb.cropLots.find((l) => l.id === id) || null;
  }

  async create(lot: Omit<CropLot, 'id' | 'created_at' | 'updated_at'>): Promise<CropLot> {
    const id = `lot-${Date.now()}`;
    const now = new Date().toISOString();
    const newLot: CropLot = {
      ...lot,
      id,
      created_at: now,
      updated_at: now,
    };

    try {
      const { data, error } = await supabaseService.from('crop_lots').insert(newLot).select().single();
      if (!error && data) return data as CropLot;
    } catch {
      // Fallback
    }

    memoryDb.cropLots.unshift(newLot);
    return newLot;
  }

  async update(id: string, updates: Partial<CropLot>): Promise<CropLot | null> {
    try {
      const { data, error } = await supabaseService
        .from('crop_lots')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as CropLot;
    } catch {
      // Fallback
    }

    const item = memoryDb.cropLots.find((l) => l.id === id);
    if (!item) return null;
    Object.assign(item, updates, { updated_at: new Date().toISOString() });
    return item;
  }

  async addImages(lotId: string, images: Array<{ image_url: string; capture_type?: string }>): Promise<LotImage[]> {
    const newImages: LotImage[] = images.map((img, i) => ({
      id: `img-${Date.now()}-${i}`,
      lot_id: lotId,
      image_url: img.image_url,
      capture_type: img.capture_type || 'STANDARD',
      created_at: new Date().toISOString(),
    }));

    try {
      const { data, error } = await supabaseService.from('lot_images').insert(newImages).select();
      if (!error && data) return data as LotImage[];
    } catch {
      // Fallback
    }

    memoryDb.lotImages.push(...newImages);
    return newImages;
  }

  async getImagesByLotId(lotId: string): Promise<LotImage[]> {
    try {
      const { data, error } = await supabaseService.from('lot_images').select('*').eq('lot_id', lotId);
      if (!error && data) return data as LotImage[];
    } catch {
      // Fallback
    }
    return memoryDb.lotImages.filter((img) => img.lot_id === lotId);
  }
}

export const lotsRepository = new LotsRepository();
