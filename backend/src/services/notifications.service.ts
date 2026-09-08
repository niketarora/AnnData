import { notificationsRepository } from '../repositories/notifications.repository.js';
import { AppNotification } from '../types/index.js';

export class NotificationsService {
  async getUserNotifications(profileId: string): Promise<AppNotification[]> {
    return notificationsRepository.findByUserId(profileId);
  }

  async markAsRead(id: string, profileId: string): Promise<boolean> {
    return notificationsRepository.markAsRead(id, profileId);
  }

  async markAllAsRead(profileId: string): Promise<void> {
    return notificationsRepository.markAllAsRead(profileId);
  }
}

export const notificationsService = new NotificationsService();
