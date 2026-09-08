import { memoryDb } from './dbStore.js';
import { supabaseService } from '../config/supabase.js';

export class AuditLogsRepository {
  async log(
    actor: string,
    action: string,
    entity: string,
    entityId: string,
    metadata: Record<string, unknown> = {}
  ): Promise<void> {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      actor,
      action,
      entity,
      entity_id: entityId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    try {
      await supabaseService.from('audit_logs').insert(entry);
    } catch {
      // Fallback
    }

    memoryDb.auditLogs.unshift(entry);
  }
}

export const auditLogsRepository = new AuditLogsRepository();
