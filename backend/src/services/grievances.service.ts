import { grievancesRepository } from '../repositories/grievances.repository.js';
import { auditLogsRepository } from '../repositories/auditLogs.repository.js';
import { Grievance } from '../types/index.js';
import { NotFoundError } from '../utils/errors.js';

export class GrievancesService {
  async getGrievances(userId?: string): Promise<Grievance[]> {
    return grievancesRepository.findAll(userId);
  }

  async getGrievanceById(id: string): Promise<Grievance> {
    const g = await grievancesRepository.findById(id);
    if (!g) throw new NotFoundError(`Grievance not found with ID ${id}`);
    return g;
  }

  async fileGrievance(
    userId: string,
    payload: {
      booking_id?: string;
      transaction_id?: string;
      type: string;
      description: string;
      attachments?: unknown[];
    }
  ): Promise<Grievance> {
    const grievance = await grievancesRepository.create({
      user_id: userId,
      booking_id: payload.booking_id,
      transaction_id: payload.transaction_id,
      type: payload.type,
      description: payload.description,
      attachments: payload.attachments || [],
      status: 'OPEN',
      created_by: userId,
    });

    await auditLogsRepository.log(userId, 'CREATE_GRIEVANCE', 'grievances', grievance.id, {
      type: payload.type,
    });

    return grievance;
  }

  async resolveGrievance(
    id: string,
    operatorId: string,
    resolution: string,
    status: 'RESOLVED' | 'REJECTED'
  ): Promise<Grievance> {
    const updated = await grievancesRepository.update(id, {
      resolution,
      status,
      assigned_to: operatorId,
      resolved_at: new Date().toISOString(),
    });

    if (!updated) throw new NotFoundError('Grievance not found');

    await auditLogsRepository.log(operatorId, 'RESOLVE_GRIEVANCE', 'grievances', id, { status });
    return updated;
  }
}

export const grievancesService = new GrievancesService();
