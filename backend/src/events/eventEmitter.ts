import { EventEmitter } from 'events';
import { logger } from '../config/logger.js';

class AppEventEmitter extends EventEmitter {
  emitEvent(eventName: string, payload: unknown): void {
    logger.debug({ eventName, payload }, 'Domain event dispatched');
    this.emit(eventName, payload);
  }
}

export const appEvents = new AppEventEmitter();
export const eventBus = appEvents;
