import { lotsRepository } from '../repositories/lots.repository.js';
import { CropLot, LotImage } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { auditLogsRepository } from '../repositories/auditLogs.repository.js';

export class LotsService {
  async getFarmerLots(farmerId: string): Promise<Array<CropLot & { images: LotImage[] }>> {
    const lots = await lotsRepository.findAll({ farmerId });
    const results: Array<CropLot & { images: LotImage[] }> = [];

    for (const lot of lots) {
      const images = await lotsRepository.getImagesByLotId(lot.id);
      results.push({ ...lot, images });
    }
    return results;
  }

  async getAllBuyerLots(status?: string): Promise<Array<CropLot & { images: LotImage[] }>> {
    const lots = await lotsRepository.findAll({ status });
    const results: Array<CropLot & { images: LotImage[] }> = [];

    for (const lot of lots) {
      const images = await lotsRepository.getImagesByLotId(lot.id);
      results.push({ ...lot, images });
    }
    return results;
  }

  async getLotById(id: string, userRole: string, farmerId?: string): Promise<CropLot & { images: LotImage[] }> {
    const lot = await lotsRepository.findById(id);
    if (!lot) throw new NotFoundError(`Crop lot not found with ID ${id}`);

    if (userRole === 'farmer' && farmerId && lot.farmer_id !== farmerId) {
      throw new ForbiddenError('You can only access your own crop lots');
    }

    const images = await lotsRepository.getImagesByLotId(id);
    return { ...lot, images };
  }

  async createLot(
    farmerId: string,
    payload: Omit<CropLot, 'id' | 'farmer_id' | 'created_at' | 'updated_at' | 'status'> & {
      images?: string[];
      status?: CropLot['status'];
    }
  ): Promise<CropLot & { images: LotImage[] }> {
    const { images, ...lotData } = payload;
    const lot = await lotsRepository.create({
      ...lotData,
      farmer_id: farmerId,
      status: payload.status || 'READY',
    });

    let savedImages: LotImage[] = [];
    if (images && images.length > 0) {
      savedImages = await lotsRepository.addImages(
        lot.id,
        images.map((url) => ({ image_url: url, capture_type: 'STANDARD' }))
      );
    }

    await auditLogsRepository.log(farmerId, 'CREATE_LOT', 'crop_lots', lot.id, {
      quantity: lot.quantity,
      cropId: lot.crop_id,
    });

    return { ...lot, images: savedImages };
  }

  async updateLot(
    id: string,
    farmerId: string,
    updates: Partial<CropLot>,
    isBuyerOrOperator = false
  ): Promise<CropLot> {
    const existing = await lotsRepository.findById(id);
    if (!existing) throw new NotFoundError(`Crop lot not found with ID ${id}`);

    if (existing.farmer_id !== farmerId && !isBuyerOrOperator) {
      throw new ForbiddenError('You can only update your own crop lots');
    }

    const updated = await lotsRepository.update(id, updates);
    if (!updated) throw new NotFoundError('Failed to update lot');

    await auditLogsRepository.log(farmerId, 'UPDATE_LOT', 'crop_lots', id, updates);
    return updated;
  }

  async addLotImages(
    id: string,
    farmerId: string,
    images: Array<{ image_url: string; capture_type?: string }>
  ): Promise<LotImage[]> {
    const existing = await lotsRepository.findById(id);
    if (!existing) throw new NotFoundError(`Crop lot not found with ID ${id}`);

    if (existing.farmer_id !== farmerId) {
      throw new ForbiddenError('You can only upload images for your own crop lots');
    }

    return lotsRepository.addImages(id, images);
  }
}

export const lotsService = new LotsService();
