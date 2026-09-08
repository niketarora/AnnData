import { LiveQueueState, DepartureState } from '../../types';

export interface IQueueService {
  getLiveQueueStatus(bookingId: string): Promise<LiveQueueState>;
  updateDepartureState(bookingId: string, newState: DepartureState): Promise<LiveQueueState>;
  addQueueDelay(minutes: number): Promise<LiveQueueState>;
  clearDelay(): Promise<LiveQueueState>;
  callNextLot(): Promise<LiveQueueState>;
}
