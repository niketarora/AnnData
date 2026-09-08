export type CropType = 'Wheat' | 'Paddy' | 'Tomato' | 'Mustard' | 'Maize' | 'Cotton';

export type LotStatus =
  | 'DRAFT'
  | 'AI_GRADED'
  | 'RECOMMENDED'
  | 'SLOT_REQUESTED'
  | 'BOOKING_CONFIRMED'
  | 'IN_TRANSIT'
  | 'GATE_CHECKED_IN'
  | 'PHYSICALLY_INSPECTED'
  | 'WEIGHED'
  | 'OFFER_RECEIVED'
  | 'OFFER_ACCEPTED'
  | 'PAID'
  | 'COMPLETED'
  | 'REJECTED';

export interface AnalyzedPhoto {
  id: string;
  url: string;
  title: string;
  detectedFeatures: string;
  confidencePercent: number;
  highlightTag?: string;
  tagColor?: 'success' | 'warning' | 'info' | 'danger';
}

export interface QualityFactor {
  name: string;
  description: string;
  value: string;
  percent: number;
  status: 'success' | 'warning' | 'info' | 'danger';
  icon: string;
}

export interface QualityAssessment {
  id: string;
  overallScore: number;
  predictedGrade: 'Grade A' | 'Grade B' | 'Grade C' | 'Rejected';
  confidenceScore: number;
  tierLabel: string;
  varietyBenchmark: string;
  minEstimatedPrice: number;
  maxEstimatedPrice: number;
  factors: QualityFactor[];
  photos: AnalyzedPhoto[];
  assessedAt: string;
  modelVersion: string;
  isPreliminary: boolean;
}

export interface CropLot {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: CropType;
  variety: string;
  quantityQuintals: number;
  harvestDate: string;
  farmLocation: string;
  status: LotStatus;
  qualityAssessment?: QualityAssessment;
  aiGrading?: {
    grade: string;
    confidenceScore: number;
  };
  images: string[];
  createdAt: string;
}
