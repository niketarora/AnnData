/**
 * Intelligence Database Repositories
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Phase 3 Data Layer with dual Supabase and MemoryDb fallback
 */

import {
  DataSource,
  DataIngestionRun,
  ExternalDataRecord,
  DataFreshness,
  ModelRegistryEntry,
  PredictionRun,
  PredictionInputSnapshot,
  Prediction,
  Recommendation,
  RecommendationFactor,
  DecisionEvent,
} from '../types/intelligence.types.js';
import { memoryDb } from './dbStore.js';
import { supabaseService, isSupabaseConfigured } from '../config/supabase.js';

export class DataSourcesRepository {
  async findAll(): Promise<DataSource[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('data_sources').select('*').eq('active', true);
        if (!error && data) return data as DataSource[];
      } catch {
        // Fallback
      }
    }
    return memoryDb.dataSources.filter((s) => s.active);
  }

  async findById(id: string): Promise<DataSource | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('data_sources').select('*').eq('id', id).single();
        if (!error && data) return data as DataSource;
      } catch {
        // Fallback
      }
    }
    return memoryDb.dataSources.find((s) => s.id === id) || null;
  }

  async updateHealth(id: string, success: boolean): Promise<void> {
    const timestamp = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const updates = success ? { last_success_at: timestamp } : { last_failure_at: timestamp };
        await supabaseService.from('data_sources').update(updates).eq('id', id);
      } catch {
        // Fallback
      }
    }
    const source = memoryDb.dataSources.find((s) => s.id === id);
    if (source) {
      if (success) source.last_success_at = timestamp;
      else source.last_failure_at = timestamp;
      source.updated_at = timestamp;
    }
  }
}

export class IngestionRunsRepository {
  async create(run: Omit<DataIngestionRun, 'id' | 'created_at'>): Promise<DataIngestionRun> {
    const newRun: DataIngestionRun = {
      ...run,
      id: `ingest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('data_ingestion_runs').insert(newRun).select().single();
        if (!error && data) return data as DataIngestionRun;
      } catch {
        // Fallback
      }
    }
    memoryDb.dataIngestionRuns.unshift(newRun);
    return newRun;
  }

  async update(id: string, updates: Partial<DataIngestionRun>): Promise<DataIngestionRun | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('data_ingestion_runs')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as DataIngestionRun;
      } catch {
        // Fallback
      }
    }
    const idx = memoryDb.dataIngestionRuns.findIndex((r) => r.id === id);
    if (idx !== -1) {
      memoryDb.dataIngestionRuns[idx] = { ...memoryDb.dataIngestionRuns[idx], ...updates };
      return memoryDb.dataIngestionRuns[idx];
    }
    return null;
  }

  async listRecent(limit: number = 20): Promise<DataIngestionRun[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('data_ingestion_runs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(limit);
        if (!error && data) return data as DataIngestionRun[];
      } catch {
        // Fallback
      }
    }
    return memoryDb.dataIngestionRuns.slice(0, limit);
  }
}

export class ExternalDataRepository {
  async insert(record: Omit<ExternalDataRecord, 'id' | 'created_at'>): Promise<ExternalDataRecord> {
    const newRecord: ExternalDataRecord = {
      ...record,
      id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('external_data_records').insert(newRecord).select().single();
        if (!error && data) return data as ExternalDataRecord;
      } catch {
        // Fallback
      }
    }
    memoryDb.externalDataRecords.unshift(newRecord);
    return newRecord;
  }

  async findLatest(entityType: string, entityId: string): Promise<ExternalDataRecord | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('external_data_records')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('observed_at', { ascending: false })
          .limit(1)
          .single();
        if (!error && data) return data as ExternalDataRecord;
      } catch {
        // Fallback
      }
    }
    return (
      memoryDb.externalDataRecords
        .filter((r) => r.entity_type === entityType && r.entity_id === entityId)
        .sort((a, b) => new Date(b.observed_at).getTime() - new Date(a.observed_at).getTime())[0] || null
    );
  }
}

export class FreshnessRepository {
  async getStatus(entityType: string, entityId: string): Promise<DataFreshness | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('data_freshness')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .single();
        if (!error && data) return data as DataFreshness;
      } catch {
        // Fallback
      }
    }
    return memoryDb.dataFreshness.find((f) => f.entity_type === entityType && f.entity_id === entityId) || null;
  }

  async getAll(): Promise<DataFreshness[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('data_freshness').select('*');
        if (!error && data) return data as DataFreshness[];
      } catch {
        // Fallback
      }
    }
    return memoryDb.dataFreshness;
  }

  async upsert(freshness: Omit<DataFreshness, 'id' | 'created_at' | 'updated_at'>): Promise<DataFreshness> {
    const timestamp = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('data_freshness')
          .upsert(
            { ...freshness, updated_at: timestamp },
            { onConflict: 'entity_type,entity_id' }
          )
          .select()
          .single();
        if (!error && data) return data as DataFreshness;
      } catch {
        // Fallback
      }
    }
    const existing = memoryDb.dataFreshness.find(
      (f) => f.entity_type === freshness.entity_type && f.entity_id === freshness.entity_id
    );
    if (existing) {
      Object.assign(existing, freshness, { updated_at: timestamp });
      return existing;
    }
    const created: DataFreshness = {
      ...freshness,
      id: `fresh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: timestamp,
      updated_at: timestamp,
    };
    memoryDb.dataFreshness.push(created);
    return created;
  }
}

export class ModelRegistryRepository {
  async findActive(modelName: string): Promise<ModelRegistryEntry | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('model_registry')
          .select('*')
          .eq('model_name', modelName)
          .eq('status', 'ACTIVE')
          .single();
        if (!error && data) return data as ModelRegistryEntry;
      } catch {
        // Fallback
      }
    }
    return memoryDb.modelRegistry.find((m) => m.model_name === modelName && m.status === 'ACTIVE') || null;
  }

  async findAllActive(): Promise<ModelRegistryEntry[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('model_registry')
          .select('*')
          .eq('status', 'ACTIVE');
        if (!error && data) return data as ModelRegistryEntry[];
      } catch {
        // Fallback
      }
    }
    return memoryDb.modelRegistry.filter((m) => m.status === 'ACTIVE');
  }
}

export class PredictionsRepository {
  async createRun(run: Omit<PredictionRun, 'id' | 'created_at'>): Promise<PredictionRun> {
    const newRun: PredictionRun = {
      ...run,
      id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('prediction_runs').insert(newRun).select().single();
        if (!error && data) return data as PredictionRun;
      } catch {
        // Fallback
      }
    }
    memoryDb.predictionRuns.unshift(newRun);
    return newRun;
  }

  async saveSnapshot(snapshot: Omit<PredictionInputSnapshot, 'id' | 'created_at'>): Promise<PredictionInputSnapshot> {
    const newSnapshot: PredictionInputSnapshot = {
      ...snapshot,
      id: `snap-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('prediction_input_snapshots').insert(newSnapshot).select().single();
        if (!error && data) return data as PredictionInputSnapshot;
      } catch {
        // Fallback
      }
    }
    memoryDb.predictionInputSnapshots.unshift(newSnapshot);
    return newSnapshot;
  }

  async savePrediction(pred: Omit<Prediction, 'id'>): Promise<Prediction> {
    const newPred: Prediction = {
      ...pred,
      id: `pred-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('predictions').insert(newPred).select().single();
        if (!error && data) return data as Prediction;
      } catch {
        // Fallback
      }
    }
    memoryDb.predictions.unshift(newPred);
    return newPred;
  }

  async findByEntity(entityType: string, entityId: string): Promise<Prediction | null> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('predictions')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .eq('status', 'ACTIVE')
          .gt('expires_at', now)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();
        if (!error && data) return data as Prediction;
      } catch {
        // Fallback
      }
    }
    return (
      memoryDb.predictions.find(
        (p) =>
          p.entity_type === entityType &&
          p.entity_id === entityId &&
          p.status === 'ACTIVE' &&
          new Date(p.expires_at) > new Date()
      ) || null
    );
  }

  async findById(id: string): Promise<Prediction | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('predictions').select('*').eq('id', id).single();
        if (!error && data) return data as Prediction;
      } catch {
        // Fallback
      }
    }
    return memoryDb.predictions.find((p) => p.id === id) || null;
  }

  async findByRequestHash(requestHash: string): Promise<Prediction | null> {
    const now = new Date().toISOString();
    const run = memoryDb.predictionRuns.find((r) => r.request_hash === requestHash);
    if (!run) return null;
    return (
      memoryDb.predictions.find(
        (p) => p.prediction_run_id === run.id && p.status === 'ACTIVE' && p.expires_at > now
      ) || null
    );
  }
}

export class RecommendationsRepository {
  async saveRecommendation(rec: Omit<Recommendation, 'id'>): Promise<Recommendation> {
    const newRec: Recommendation = {
      ...rec,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('recommendations').insert(newRec).select().single();
        if (!error && data) return data as Recommendation;
      } catch {
        // Fallback
      }
    }
    memoryDb.recommendations.unshift(newRec);
    return newRec;
  }

  async saveFactors(factors: Array<Omit<RecommendationFactor, 'id' | 'created_at'>>): Promise<RecommendationFactor[]> {
    const createdFactors = factors.map((f) => ({
      ...f,
      id: `fac-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    }));
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('recommendation_factors').insert(createdFactors).select();
        if (!error && data) return data as RecommendationFactor[];
      } catch {
        // Fallback
      }
    }
    memoryDb.recommendationFactors.push(...createdFactors);
    return createdFactors;
  }

  async findLatestByEntity(entityType: string, entityId: string): Promise<Recommendation | null> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('recommendations')
          .select('*')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .eq('status', 'ACTIVE')
          .gt('expires_at', now)
          .order('generated_at', { ascending: false })
          .limit(1)
          .single();
        if (!error && data) {
          const rec = data as Recommendation;
          const { data: factors } = await supabaseService
            .from('recommendation_factors')
            .select('*')
            .eq('recommendation_id', rec.id);
          rec.factors = (factors || []) as RecommendationFactor[];
          return rec;
        }
      } catch {
        // Fallback
      }
    }
    const rec = memoryDb.recommendations.find(
      (r) =>
        r.entity_type === entityType &&
        r.entity_id === entityId &&
        r.status === 'ACTIVE' &&
        new Date(r.expires_at) > new Date()
    );
    if (rec) {
      rec.factors = memoryDb.recommendationFactors.filter((f) => f.recommendation_id === rec.id);
      return rec;
    }
    return null;
  }

  async findById(id: string): Promise<Recommendation | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('recommendations').select('*').eq('id', id).single();
        if (!error && data) {
          const rec = data as Recommendation;
          const { data: factors } = await supabaseService
            .from('recommendation_factors')
            .select('*')
            .eq('recommendation_id', rec.id);
          rec.factors = (factors || []) as RecommendationFactor[];
          return rec;
        }
      } catch {
        // Fallback
      }
    }
    const rec = memoryDb.recommendations.find((r) => r.id === id) || null;
    if (rec) {
      rec.factors = memoryDb.recommendationFactors.filter((f) => f.recommendation_id === rec.id);
    }
    return rec;
  }
}

export class DecisionEventsRepository {
  async create(event: Omit<DecisionEvent, 'id' | 'created_at'>): Promise<DecisionEvent> {
    const newEvent: DecisionEvent = {
      ...event,
      id: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService.from('decision_events').insert(newEvent).select().single();
        if (!error && data) return data as DecisionEvent;
      } catch {
        // Fallback
      }
    }
    memoryDb.decisionEvents.unshift(newEvent);
    return newEvent;
  }

  async findByUser(userId: string): Promise<DecisionEvent[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseService
          .from('decision_events')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) return data as DecisionEvent[];
      } catch {
        // Fallback
      }
    }
    return memoryDb.decisionEvents.filter((d) => d.user_id === userId);
  }
}

export const dataSourcesRepository = new DataSourcesRepository();
export const ingestionRunsRepository = new IngestionRunsRepository();
export const externalDataRepository = new ExternalDataRepository();
export const freshnessRepository = new FreshnessRepository();
export const modelRegistryRepository = new ModelRegistryRepository();
export const predictionsRepository = new PredictionsRepository();
export const recommendationsRepository = new RecommendationsRepository();
export const decisionEventsRepository = new DecisionEventsRepository();
