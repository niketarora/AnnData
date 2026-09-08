import { IQueueService } from '../interfaces/IQueueService';
import { LiveQueueState, DepartureState } from '../../types';
import { mockStore } from '../../store';

export class QueueMockService implements IQueueService {
  async getLiveQueueStatus(_bookingId: string): Promise<LiveQueueState> {
    return mockStore.getState().queue;
  }

  async updateDepartureState(_bookingId: string, newState: DepartureState): Promise<LiveQueueState> {
    mockStore.setDepartureState(newState);
    return mockStore.getState().queue;
  }

  async addQueueDelay(minutes: number): Promise<LiveQueueState> {
    mockStore.addQueueDelay(minutes);
    return mockStore.getState().queue;
  }

  async clearDelay(): Promise<LiveQueueState> {
    mockStore.clearQueueDelay();
    return mockStore.getState().queue;
  }

  async callNextLot(): Promise<LiveQueueState> {
    const queue = mockStore.getState().queue;
    if (queue.lotsAhead > 0) {
      queue.lotsAhead -= 1;
    }
    if (queue.lotsAhead === 0) {
      mockStore.setDepartureState('LEAVE_NOW');
    }
    return queue;
  }
}

export const queueMockService = new QueueMockService();
