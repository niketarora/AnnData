import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';
import { UnauthorizedError } from '../utils/errors.js';

export class AuthController {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const userDetails = await authService.getCurrentUserProfile(req.user);
      sendSuccess(res, userDetails, 'User profile retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
