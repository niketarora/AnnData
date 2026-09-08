/**
 * Recommendation API Service
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 32: Frontend Recommendation API Service
 */

import { apiClient } from './api';
import { Recommendation } from '../features/intelligence/types/intelligence.types';

export class RecommendationApiService {
  async getByEntity(entityType: string, entityId: string): Promise<Recommendation> {
    return apiClient.get<Recommendation>(`/recommendations/entity/${entityType}/${entityId}`);
  }

  async refreshByEntity(entityType: string, entityId: string): Promise<Recommendation> {
    return apiClient.post<Recommendation>(`/recommendations/entity/${entityType}/${entityId}/refresh`);
  }

  async getById(id: string): Promise<Recommendation> {
    return apiClient.get<Recommendation>(`/recommendations/${id}`);
  }
}

export const recommendationApi = new RecommendationApiService();
