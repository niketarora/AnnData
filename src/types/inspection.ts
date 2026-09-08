export interface PhysicalInspection {
  id: string;
  bookingId: string;
  lotId: string;
  aiPreGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Rejected';
  physicalGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Rejected';
  moisturePercent: number;
  moistureReading?: number;
  admixturePercent: number;
  foreignMatterPercent?: number;
  damagedGrainPercent: number;
  verifiedScore?: number;
  checklists: {
    label: string;
    passed: boolean;
  }[];
  inspectorNotes: string;
  inspectedBy: string;
  inspectorName?: string;
  inspectedAt: string;
  status: 'PASSED' | 'REJECTED' | 'CONDITIONAL' | 'VERIFIED';
}

export interface WeighmentRecord {
  id: string;
  bookingId: string;
  lotId: string;
  expectedQuantityKg: number;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  netQuintals: number;
  scaleCalibrationVerified: boolean;
  verified?: boolean;
  scaleOperator: string;
  operatorName?: string;
  weighedAt: string;
  scaleSlipNumber: string;
  weighbridgeSlipNumber?: string;
}
