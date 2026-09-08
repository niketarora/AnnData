/**
 * useRecommendation Hook
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 32: Selling Recommendation Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { recommendationApi } from '../../../services/recommendationApi';
import { Recommendation } from '../types/intelligence.types';

export function useRecommendation(entityType: string, entityId: string) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await recommendationApi.getByEntity(entityType, entityId);
      setRecommendation(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching recommendation');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchRecommendation();
  }, [fetchRecommendation]);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await recommendationApi.refreshByEntity(entityType, entityId);
      setRecommendation(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error refreshing recommendation');
    } finally {
      setLoading(false);
    }
  };

  return { recommendation, loading, error, refresh };
}
