/**
 * usePrediction Hook
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 32: Price Forecast Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { predictionApi } from '../../../services/predictionApi';
import { Prediction } from '../types/intelligence.types';

export function usePrediction(entityType: string, entityId: string) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrediction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await predictionApi.getByEntity(entityType, entityId);
      setPrediction(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching prediction');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchPrediction();
  }, [fetchPrediction]);

  return { prediction, loading, error, refetch: fetchPrediction };
}
