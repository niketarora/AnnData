import { IBookingService } from '../interfaces/IBookingService';
import { Booking, BookingSlot } from '../../types';
import { mockStore } from '../../store';

export class BookingMockService implements IBookingService {
  async getAvailableSlots(_marketId: string, _date: string): Promise<BookingSlot[]> {
    return [
      { id: 'slot-1', startTime: '08:00', endTime: '09:00', displayTime: '08:00 – 09:00 AM', availableSpots: 4 },
      { id: 'slot-2', startTime: '09:00', endTime: '10:00', displayTime: '09:00 – 10:00 AM', availableSpots: 2 },
      { id: 'slot-3', startTime: '10:30', endTime: '11:30', displayTime: '10:30 – 11:30 AM', availableSpots: 5 },
      { id: 'slot-4', startTime: '13:00', endTime: '14:00', displayTime: '01:00 – 02:00 PM', availableSpots: 1 },
      { id: 'slot-5', startTime: '15:30', endTime: '16:00', displayTime: '03:30 – 04:00 PM', availableSpots: 6 },
      { id: 'slot-6', startTime: '16:00', endTime: '17:00', displayTime: '04:00 – 05:00 PM', availableSpots: 3 },
    ];
  }

  async createBooking(
    lotId: string,
    marketId: string,
    slotId: string,
    vehicleNumber: string,
    driverName: string
  ): Promise<Booking> {
    const market = mockStore.getState().markets.find((m) => m.id === marketId);
    const slots = await this.getAvailableSlots(marketId, 'Today');
    const slot = slots.find((s) => s.id === slotId) || slots[4];

    const tokenNum = `MKT-B-${Math.floor(100 + Math.random() * 900)}`;
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      tokenNumber: tokenNum,
      lotId,
      farmerId: mockStore.getState().farmer.id,
      farmerName: mockStore.getState().farmer.name,
      marketId,
      marketName: market?.name || 'Taraori APMC Mandi',
      destinationMandi: `${market?.name || 'Taraori'} Gate 2`,
      scheduledSlot: slot.displayTime,
      date: 'Today, 08 Sep 2026',
      vehicleNumber,
      driverName,
      assignedGate: 'Gate 2 Express Line',
      status: 'CONFIRMED',
      createdAt: 'Just now',
    };

    const state = mockStore.getState();
    state.bookings.unshift(newBooking);
    state.activeBookingId = newBooking.id;
    state.queue.tokenNumber = tokenNum;

    return newBooking;
  }

  async getBookingById(id: string): Promise<Booking | undefined> {
    return mockStore.getState().bookings.find((b) => b.id === id);
  }

  async getFarmerBookings(_farmerId?: string): Promise<Booking[]> {
    return mockStore.getState().bookings;
  }

  async getBuyerBookings(_marketId?: string): Promise<Booking[]> {
    return mockStore.getState().bookings;
  }
}

export const bookingMockService = new BookingMockService();
