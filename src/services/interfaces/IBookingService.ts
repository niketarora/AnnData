import { Booking, BookingSlot } from '../../types';

export interface IBookingService {
  getAvailableSlots(marketId: string, date: string): Promise<BookingSlot[]>;
  createBooking(lotId: string, marketId: string, slotId: string, vehicleNumber: string, driverName: string): Promise<Booking>;
  getBookingById(id: string): Promise<Booking | undefined>;
  getFarmerBookings(farmerId?: string): Promise<Booking[]>;
  getBuyerBookings(marketId?: string): Promise<Booking[]>;
}
