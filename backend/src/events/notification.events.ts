import { appEvents } from './eventEmitter.js';
import { AppNotification } from '../types/index.js';

export const NOTIFICATION_EVENTS = {
  CREATED: 'notification:created',
  READ: 'notification:read',
};

export function emitNotificationEvent(event: string, notification: AppNotification): void {
  appEvents.emitEvent(event, {
    notificationId: notification.id,
    userId: notification.user_id,
    title: notification.title,
    message: notification.message,
    category: notification.category,
    timestamp: new Date().toISOString(),
  });
}
