import { PhysicalInspection, WeighmentRecord } from '../../types';

export interface IInspectionService {
  getInspectionByBooking(bookingId: string): Promise<PhysicalInspection | undefined>;
  submitPhysicalInspection(data: Omit<PhysicalInspection, 'id' | 'inspectedAt'>): Promise<PhysicalInspection>;
  getWeighmentByBooking(bookingId: string): Promise<WeighmentRecord | undefined>;
  recordWeighment(data: Omit<WeighmentRecord, 'id' | 'weighedAt'>): Promise<WeighmentRecord>;
}
