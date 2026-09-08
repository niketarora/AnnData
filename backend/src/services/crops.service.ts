import { cropsRepository } from '../repositories/crops.repository.js';
import { Crop } from '../types/index.js';
import { NotFoundError } from '../utils/errors.js';

export class CropsService {
  async getAllCrops(): Promise<Crop[]> {
    return cropsRepository.findAll();
  }

  async getCropById(id: string): Promise<Crop> {
    const crop = await cropsRepository.findById(id);
    if (!crop) throw new NotFoundError(`Crop not found with ID ${id}`);
    return crop;
  }
}

export const cropsService = new CropsService();
