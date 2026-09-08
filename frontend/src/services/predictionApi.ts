/**
 * Prediction API Service
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 32: Frontend Prediction API Service
 */

import { apiClient } from './api';
import { Prediction } from '../features/intelligence/types/intelligence.types';

export interface CreatePredictionParams {
  crop: string;
  variety: string;
  historicalModalPrice: number;
  marketCode?: string;
  state?: string;
  district?: string;
}

export class PredictionApiService {
  async getByEntity(entityType: string, entityId: string): Promise<Prediction> {
    return apiClient.get<Prediction>(`/predictions/entity/${entityType}/${entityId}`);
  }

  async create(params: CreatePredictionParams): Promise<Prediction> {
    return apiClient.post<Prediction>('/predictions', params);
  }

  async getById(id: string): Promise<Prediction> {
    return apiClient.get<Prediction>(`/predictions/${id}`);
  }
}

export const predictionApi = new PredictionApiService();
