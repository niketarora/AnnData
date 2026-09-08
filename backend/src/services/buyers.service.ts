import { buyersRepository } from '../repositories/buyers.repository.js';
import { profilesRepository } from '../repositories/profiles.repository.js';
import { Buyer, Profile } from '../types/index.js';
import { NotFoundError } from '../utils/errors.js';

export class BuyersService {
  async getBuyerProfile(profileId: string): Promise<{ profile: Profile; buyer: Buyer }> {
    const profile = await profilesRepository.findById(profileId);
    if (!profile) throw new NotFoundError('Buyer profile not found');

    const buyer = await buyersRepository.findByProfileId(profileId);
    if (!buyer) throw new NotFoundError('Buyer record not found');

    return { profile, buyer };
  }

  async getAllBuyers(): Promise<Buyer[]> {
    return buyersRepository.findAll();
  }

  async updateBuyer(
    buyerId: string,
    profileUpdates?: Partial<Profile>,
    buyerUpdates?: Partial<Buyer>
  ): Promise<{ profile: Profile; buyer: Buyer }> {
    const existing = await buyersRepository.findById(buyerId);
    if (!existing) throw new NotFoundError('Buyer record not found');

    let updatedBuyer = existing;
    if (buyerUpdates) {
      const res = await buyersRepository.update(buyerId, buyerUpdates);
      if (res) updatedBuyer = res;
    }

    let updatedProfile = (await profilesRepository.findById(existing.profile_id))!;
    if (profileUpdates) {
      const res = await profilesRepository.update(existing.profile_id, profileUpdates);
      if (res) updatedProfile = res;
    }

    return { profile: updatedProfile, buyer: updatedBuyer };
  }
}

export const buyersService = new BuyersService();
