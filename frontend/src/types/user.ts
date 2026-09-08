export type UserRole = 'FARMER' | 'BUYER' | 'OPERATOR';

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  location: string;
  mandiRegion: string;
  farmSizeAcres: number;
  vehicleType: string;
  vehiclePlate: string;
  bankAccount: {
    accountNumberMasked: string;
    bankName: string;
    ifsc: string;
    upiId: string;
    verified: boolean;
  };
  preferredMarkets: string[];
}

export interface BuyerProfile {
  id: string;
  name: string;
  phone: string;
  phoneNumber?: string;
  avatarUrl?: string;
  organizationName: string;
  firmName?: string;
  marketName: string;
  mandiGate: string;
  counterId: string;
  licenseNumber: string;
  paymentReliabilityScore: number;
  dailyCapacityQuintals: number;
}
