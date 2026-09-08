import { Request, Response, NextFunction } from 'express';
import { notificationsService } from '../services/notifications.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';
import { getParam } from '../utils/params.js';

export class NotificationsController {
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const notifs = await notificationsService.getUserNotifications(req.user.profileId);
      sendSuccess(res, notifs);
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await notificationsService.markAsRead(getParam(req, 'id'), req.user.profileId);
      sendSuccess(res, { success: true }, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await notificationsService.markAllAsRead(req.user.profileId);
      sendSuccess(res, { success: true }, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }
}

export const notificationsController = new NotificationsController();
