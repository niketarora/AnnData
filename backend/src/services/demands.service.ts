import { demandsRepository } from '../repositories/demands.repository.js';
import { BuyerDemand } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { auditLogsRepository } from '../repositories/auditLogs.repository.js';

export class DemandsService {
  async getAllDemands(filters?: { buyerId?: string; cropId?: string; status?: string }): Promise<BuyerDemand[]> {
    return demandsRepository.findAll(filters);
  }

  async getDemandById(id: string): Promise<BuyerDemand> {
    const demand = await demandsRepository.findById(id);
    if (!demand) throw new NotFoundError(`Buyer demand not found with ID ${id}`);
    return demand;
  }

  async createDemand(buyerId: string, payload: Omit<BuyerDemand, 'id' | 'buyer_id' | 'quantity_fulfilled' | 'created_at' | 'updated_at' | 'status'> & { status?: BuyerDemand['status'] }): Promise<BuyerDemand> {
    const demand = await demandsRepository.create({
      ...payload,
      buyer_id: buyerId,
      quantity_fulfilled: 0,
      status: payload.status || 'ACTIVE',
    });

    await auditLogsRepository.log(buyerId, 'CREATE_DEMAND', 'buyer_demands', demand.id, {
      cropId: demand.crop_id,
      quantity: demand.quantity_required,
    });

    return demand;
  }

  async updateDemand(
    id: string,
    buyerId: string,
    updates: Partial<BuyerDemand>,
    isOperator = false
  ): Promise<BuyerDemand> {
    const existing = await this.getDemandById(id);
    if (existing.buyer_id !== buyerId && !isOperator) {
      throw new ForbiddenError('You can only update your own demands');
    }

    const updated = await demandsRepository.update(id, updates);
    if (!updated) throw new NotFoundError('Demand not found');

    await auditLogsRepository.log(buyerId, 'UPDATE_DEMAND', 'buyer_demands', id, updates);
    return updated;
  }

  async deleteDemand(id: string, buyerId: string, isOperator = false): Promise<void> {
    const existing = await this.getDemandById(id);
    if (existing.buyer_id !== buyerId && !isOperator) {
      throw new ForbiddenError('You can only delete your own demands');
    }

    await demandsRepository.delete(id);
    await auditLogsRepository.log(buyerId, 'DELETE_DEMAND', 'buyer_demands', id);
  }
}

export const demandsService = new DemandsService();
