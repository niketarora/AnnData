import { appEvents } from './eventEmitter.js';
import { DepartureState } from '../types/index.js';

export const QUEUE_EVENTS = {
  DELAY_ADDED: 'queue:delay_added',
  DELAY_CLEARED: 'queue:delay_cleared',
  STATE_CHANGED: 'queue:state_changed',
  LOT_CALLED: 'queue:lot_called',
  CHECKED_IN: 'queue:checked_in',
};

export function emitQueueDelayEvent(marketId: string, delayMinutes: number): void {
  appEvents.emitEvent(QUEUE_EVENTS.DELAY_ADDED, {
    marketId,
    delayMinutes,
    timestamp: new Date().toISOString(),
  });
}

export function emitQueueStateChanged(
  bookingId: string,
  departureState: DepartureState,
  estimatedWaitMinutes: number
): void {
  appEvents.emitEvent(QUEUE_EVENTS.STATE_CHANGED, {
    bookingId,
    departureState,
    estimatedWaitMinutes,
    timestamp: new Date().toISOString(),
  });
}
