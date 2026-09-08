/**
 * useIntelligence Hook
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 32 & 33: Frontend State Model with Stale & Fallback Support
 */

import { useState, useEffect, useCallback } from 'react';
import { intelligenceApi } from '../../../services/intelligenceApi';
import {
  FullIntelligenceBundle,
  DataFreshnessStatus,
} from '../types/intelligence.types';

export type IntelligenceViewState =
  | 'idle'
  | 'loading'
  | 'success'
  | 'stale'
  | 'error'
  | 'unavailable';

export interface UseIntelligenceReturn {
  bundle: FullIntelligenceBundle | null;
  viewState: IntelligenceViewState;
  freshnessStatus: DataFreshnessStatus;
  isStale: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
  refresh: () => Promise<void>;
}

export function useIntelligence(
  entityType: string,
  entityId: string
): UseIntelligenceReturn {
  const [bundle, setBundle] = useState<FullIntelligenceBundle | null>(null);
  const [viewState, setViewState] = useState<IntelligenceViewState>('loading');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBundle = useCallback(
    async (isRefreshAction: boolean = false) => {
      if (isRefreshAction) setIsRefreshing(true);
      else setViewState('loading');
      setErrorMessage(null);

      try {
        const data = isRefreshAction
          ? await intelligenceApi.refreshBundle(entityType, entityId)
          : await intelligenceApi.getBundle(entityType, entityId);

        setBundle(data);
        const status = data.freshness?.status || 'LIVE';
        if (status === 'STALE') {
          setViewState('stale');
        } else if (status === 'UNAVAILABLE') {
          setViewState('unavailable');
        } else {
          setViewState('success');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch intelligence';
        setErrorMessage(msg);
        // Retain existing bundle if available, otherwise switch to error
        setViewState((prev) => (prev === 'success' || prev === 'stale' ? prev : 'error'));
      } finally {
        setIsRefreshing(false);
      }
    },
    [entityType, entityId]
  );

  useEffect(() => {
    fetchBundle();
  }, [fetchBundle]);

  const refresh = useCallback(async () => {
    await fetchBundle(true);
  }, [fetchBundle]);

  const freshnessStatus: DataFreshnessStatus = bundle?.freshness?.status || 'LIVE';
  const isStale = freshnessStatus === 'STALE';

  return {
    bundle,
    viewState,
    freshnessStatus,
    isStale,
    isRefreshing,
    errorMessage,
    refresh,
  };
}
