import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { logger } from './logger.js';

export const isSupabaseConfigured =
  env.SUPABASE_ENABLED &&
  !env.SUPABASE_URL.includes('mock.supabase.co') &&
  env.NODE_ENV !== 'test';

// Service role client - ONLY for backend administrative tasks
export const supabaseService: SupabaseClient = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Scoped client for user operations that respects Row Level Security
export function createScopedClient(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

if (isSupabaseConfigured) {
  logger.info({ url: env.SUPABASE_URL }, 'Supabase cloud client active');
} else {
  logger.info('Running in local/test database store mode');
}
