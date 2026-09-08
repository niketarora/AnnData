import { INotificationService } from '../interfaces/INotificationService';
import { AppNotification } from '../../types';
import { mockStore } from '../../store';

export class NotificationMockService implements INotificationService {
  async getNotifications(role?: 'FARMER' | 'BUYER'): Promise<AppNotification[]> {
    const list = mockStore.getState().notifications;
    if (!role) return list;
    return list.filter((n) => n.recipientRole === role || n.recipientRole === 'ALL');
  }

  async markAsRead(id: string): Promise<void> {
    mockStore.markNotificationAsRead(id);
  }

  async markAllAsRead(): Promise<void> {
    mockStore.markAllNotificationsAsRead();
  }
}

export const notificationMockService = new NotificationMockService();
