import { ICropService } from '../interfaces/ICropService';
import { CropLot, QualityAssessment } from '../../types';
import { mockStore } from '../../store';

export class FarmerMockService implements ICropService {
  async getCropLots(_farmerId?: string): Promise<CropLot[]> {
    return mockStore.getState().lots;
  }

  async getCropLotById(id: string): Promise<CropLot | undefined> {
    return mockStore.getState().lots.find((l) => l.id === id);
  }

  async createCropLot(lot: Omit<CropLot, 'id' | 'status' | 'createdAt'>): Promise<CropLot> {
    const newLot: CropLot = {
      ...lot,
      id: `lot-${Date.now()}`,
      status: 'AI_GRADED',
      createdAt: new Date().toISOString().split('T')[0],
      qualityAssessment: {
        id: `qa-${Date.now()}`,
        overallScore: 89,
        predictedGrade: 'Grade A',
        confidenceScore: 92,
        tierLabel: 'Top Quality Tier',
        varietyBenchmark: `${lot.variety} Premium`,
        minEstimatedPrice: 2450,
        maxEstimatedPrice: 2550,
        assessedAt: 'Just now',
        modelVersion: 'v3.4 Agmarknet Verified',
        isPreliminary: true,
        factors: [
          {
            name: 'Grain Uniformity',
            description: 'High uniformity across kernel sample',
            value: '93%',
            percent: 93,
            status: 'success',
            icon: 'grain',
          },
          {
            name: 'Moisture Content',
            description: 'Optimal dry storage level',
            value: '11.5%',
            percent: 80,
            status: 'info',
            icon: 'water_drop',
          },
          {
            name: 'Foreign Matter',
            description: 'Negligible admixture present',
            value: '0.6%',
            percent: 12,
            status: 'success',
            icon: 'filter_alt',
          },
          {
            name: 'Visible Damage',
            description: 'Clean kernels, no insect chips',
            value: '0.9%',
            percent: 18,
            status: 'success',
            icon: 'broken_image',
          },
          {
            name: 'Appearance & Lustre',
            description: 'Healthy vibrant gloss',
            value: '92%',
            percent: 92,
            status: 'success',
            icon: 'light_mode',
          },
        ],
        photos: lot.images.map((url, i) => ({
          id: `p-${i}`,
          url,
          title: `Inspection Angle #${i + 1}`,
          detectedFeatures: '94% Pure whole grain',
          confidencePercent: 93,
          highlightTag: 'Clean Sample',
          tagColor: 'success',
        })),
      },
    };

    mockStore.addCropLot(newLot);
    return newLot;
  }

  async assessQuality(lotId: string, _images: string[]): Promise<QualityAssessment> {
    const lot = await this.getCropLotById(lotId);
    if (lot?.qualityAssessment) {
      return lot.qualityAssessment;
    }
    throw new Error('Quality assessment not found');
  }
}

export const farmerMockService = new FarmerMockService();
