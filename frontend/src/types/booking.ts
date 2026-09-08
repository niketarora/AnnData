export type BookingStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'INSPECTION'
  | 'WEIGHED'
  | 'SALE_OFFER'
  | 'PAID'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DELAYED';

export interface BookingSlot {
  id: string;
  startTime: string;
  endTime: string;
  displayTime: string;
  availableSpots: number;
}

export interface Booking {
  id: string;
  tokenNumber: string; // e.g., MKT-B-142
  lotId: string;
  farmerId: string;
  farmerName: string;
  marketId: string;
  marketName: string;
  destinationMandi: string;
  scheduledSlot: string; // "3:30 – 4:00 PM"
  adjustedSlot?: string; // "4:15 PM Adjusted"
  date: string;
  vehicleNumber: string;
  driverName: string;
  assignedGate: string; // "Gate 2 Express Line"
  status: BookingStatus;
  createdAt: string;
}
