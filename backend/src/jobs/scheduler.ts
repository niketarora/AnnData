/**
 * Background Scheduler Runner
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 10 & 11: In-process background job coordinator
 */

import { runMarketSyncJob } from './marketSync.job.js';
import { runFreshnessJob } from './freshness.job.js';
import { runPredictionRefreshJob } from './prediction.job.js';
import { runRecommendationRefreshJob } from './recommendation.job.js';
import { runProviderHealthJob } from './providerHealth.job.js';
import { logger } from '../config/logger.js';

export class BackgroundScheduler {
  private intervals: NodeJS.Timeout[] = [];
  private isRunning = false;

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Initializing Phase 3 Intelligence Background Scheduler...');

    // 1. Market sync every 15 minutes (900,000 ms)
    this.intervals.push(
      setInterval(() => {
        runMarketSyncJob().catch((err) => logger.error({ err }, 'Error in marketSync interval'));
      }, 15 * 60 * 1000)
    );

    // 2. Freshness check every 5 minutes (300,000 ms)
    this.intervals.push(
      setInterval(() => {
        runFreshnessJob().catch((err) => logger.error({ err }, 'Error in freshness interval'));
      }, 5 * 60 * 1000)
    );

    // 3. Provider health ping every 10 minutes (600,000 ms)
    this.intervals.push(
      setInterval(() => {
        runProviderHealthJob().catch((err) => logger.error({ err }, 'Error in providerHealth interval'));
      }, 10 * 60 * 1000)
    );

    // 4. Recommendation refresh every 30 minutes (1,800,000 ms)
    this.intervals.push(
      setInterval(() => {
        runRecommendationRefreshJob().catch((err) => logger.error({ err }, 'Error in recommendation refresh interval'));
      }, 30 * 60 * 1000)
    );
  }

  public stop(): void {
    for (const interval of this.intervals) {
      clearInterval(interval);
    }
    this.intervals = [];
    this.isRunning = false;
    logger.info('Background Scheduler stopped');
  }

  public getStatus(): { isRunning: boolean; activeJobsCount: number } {
    return {
      isRunning: this.isRunning,
      activeJobsCount: this.intervals.length,
    };
  }
}

export const backgroundScheduler = new BackgroundScheduler();
