export type NotificationCategory = 'QUEUE' | 'OFFER' | 'PAYMENT' | 'MARKET' | 'SYSTEM';

export interface AppNotification {
  id: string;
  recipientRole: 'FARMER' | 'BUYER' | 'ALL';
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRoute?: string;
  badge?: string;
}
