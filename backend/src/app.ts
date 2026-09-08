import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { rateLimit } from './middleware/rateLimit.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';
import { logger } from './config/logger.js';

export function createApp(): Express {
  const app = express();

  // Security Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    })
  );

  // Body Parsing & Size Limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request Logging & Rate Limiting
  app.use(rateLimit);
  app.use((req, _res, next) => {
    logger.debug({ method: req.method, url: req.url, ip: req.ip }, 'HTTP Request');
    next();
  });

  // Health Check Endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'UP',
      api: 'AgriFintech Operating System API',
      version: '2.0.0',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Router under /api/v1
  app.use('/api/v1', apiRouter);

  // 404 & Error Handling
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
