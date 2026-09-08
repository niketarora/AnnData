import { AppNotification } from '../../types';

export interface INotificationService {
  getNotifications(role?: 'FARMER' | 'BUYER'): Promise<AppNotification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}
