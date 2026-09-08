import { CropLot, QualityAssessment } from '../../types';

export interface ICropService {
  getCropLots(farmerId?: string): Promise<CropLot[]>;
  getCropLotById(id: string): Promise<CropLot | undefined>;
  createCropLot(lot: Omit<CropLot, 'id' | 'status' | 'createdAt'>): Promise<CropLot>;
  assessQuality(lotId: string, images: string[]): Promise<QualityAssessment>;
}
