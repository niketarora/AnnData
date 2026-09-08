import { Request, Response, NextFunction } from 'express';
import { supabaseService } from '../config/supabase.js';
import { UnauthorizedError } from '../utils/errors.js';
import { AuthContext, UserRole } from '../types/index.js';
import { logger } from '../config/logger.js';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthContext;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.split(' ')[1];

  try {
    // 1. Development & Demo token support
    if (token === 'farmer-demo-token' || token === 'mock-farmer-jwt') {
      req.user = {
        userId: '11111111-1111-1111-1111-111111111111',
        profileId: '00000000-0000-0000-0000-000000000001',
        role: 'farmer',
        farmerId: 'f0000000-0000-0000-0000-000000000001',
        token,
      };
      return next();
    }

    if (token === 'buyer-demo-token' || token === 'mock-buyer-jwt') {
      req.user = {
        userId: '22222222-2222-2222-2222-222222222222',
        profileId: '00000000-0000-0000-0000-000000000002',
        role: 'buyer',
        buyerId: 'b0000000-0000-0000-0000-000000000001',
        token,
      };
      return next();
    }

    // 2. Production Supabase JWT verification
    const { data: authData, error: authError } = await supabaseService.auth.getUser(token);

    if (authError || !authData.user) {
      logger.warn({ err: authError }, 'Supabase auth token verification failed');
      return next(new UnauthorizedError('Invalid or expired authentication token'));
    }

    const userId = authData.user.id;

    // Fetch user profile from profiles table
    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('id, role')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return next(new UnauthorizedError('User profile not found in database'));
    }

    let farmerId: string | undefined;
    let buyerId: string | undefined;

    if (profile.role === 'farmer') {
      const { data: farmer } = await supabaseService
        .from('farmers')
        .select('id')
        .eq('profile_id', profile.id)
        .single();
      farmerId = farmer?.id;
    } else if (profile.role === 'buyer') {
      const { data: buyer } = await supabaseService
        .from('buyers')
        .select('id')
        .eq('profile_id', profile.id)
        .single();
      buyerId = buyer?.id;
    }

    req.user = {
      userId,
      profileId: profile.id,
      role: profile.role as UserRole,
      farmerId,
      buyerId,
      token,
    };

    next();
  } catch (err) {
    next(err);
  }
}
