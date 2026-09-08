import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const rawAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  'mock-anon-key-agrifintech';

const rawServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  'mock-service-role-key-agrifintech';

const envSchema = z.object({
  PORT: z.string().default('4000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SUPABASE_URL: z.string().default('https://mock.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default(rawAnonKey),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(rawServiceKey),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_JWKS_URL: z.string().optional(),
  SUPABASE_ENABLED: z.string().default('false').transform((val) => val === 'true'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z.string().default('1000').transform((val) => parseInt(val, 10)),
  APP_DATA_MODE: z.enum(['mock', 'production']).default('mock'),
  ML_SERVICE_URL: z.string().default('http://localhost:8000'),
  ML_SERVICE_KEY: z.string().default(''),
  MARKET_DATA_BASE_URL: z.string().default('https://api.data.gov.in'),
  MARKET_DATA_API_KEY: z.string().default(''),
  INTELLIGENCE_CACHE_TTL: z.string().default('900').transform((val) => parseInt(val, 10)),
  INTELLIGENCE_REFRESH_LIMIT: z.string().default('60').transform((val) => parseInt(val, 10)),
});

export const env = envSchema.parse({
  ...process.env,
  SUPABASE_ANON_KEY: rawAnonKey,
  SUPABASE_SERVICE_ROLE_KEY: rawServiceKey,
});

