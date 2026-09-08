import { CropLot, PhysicalInspection, WeighmentRecord } from '../../types';
import { mockStore } from '../../store';
import { IInspectionService } from '../interfaces/IInspectionService';

export class BuyerMockService implements IInspectionService {
  async getIncomingLots(): Promise<CropLot[]> {
    return mockStore.getState().lots;
  }

  async getInspectionByBooking(bookingId: string): Promise<PhysicalInspection | undefined> {
    return mockStore.getState().inspections[bookingId];
  }

  async submitPhysicalInspection(data: Omit<PhysicalInspection, 'id' | 'inspectedAt'>): Promise<PhysicalInspection> {
    const inspection: PhysicalInspection = {
      ...data,
      id: `insp-${Date.now()}`,
      inspectedAt: 'Just now',
    };
    mockStore.submitPhysicalInspection(inspection);
    return inspection;
  }

  async getWeighmentByBooking(bookingId: string): Promise<WeighmentRecord | undefined> {
    return mockStore.getState().weighments[bookingId];
  }

  async recordWeighment(data: Omit<WeighmentRecord, 'id' | 'weighedAt'>): Promise<WeighmentRecord> {
    const record: WeighmentRecord = {
      ...data,
      id: `wm-${Date.now()}`,
      weighedAt: 'Just now',
    };
    mockStore.recordWeighment(record);
    return record;
  }
}

export const buyerMockService = new BuyerMockService();
