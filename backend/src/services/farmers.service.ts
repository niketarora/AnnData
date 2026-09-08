import { farmersRepository } from '../repositories/farmers.repository.js';
import { profilesRepository } from '../repositories/profiles.repository.js';
import { Farmer, Profile } from '../types/index.js';
import { NotFoundError } from '../utils/errors.js';

export class FarmersService {
  async getFarmerProfile(profileId: string): Promise<{ profile: Profile; farmer: Farmer }> {
    const profile = await profilesRepository.findById(profileId);
    if (!profile) throw new NotFoundError('Farmer profile not found');

    const farmer = await farmersRepository.findByProfileId(profileId);
    if (!farmer) throw new NotFoundError('Farmer record not found');

    return { profile, farmer };
  }

  async updateFarmer(
    farmerId: string,
    profileUpdates?: Partial<Profile>,
    farmerUpdates?: Partial<Farmer>
  ): Promise<{ profile: Profile; farmer: Farmer }> {
    const existing = await farmersRepository.findById(farmerId);
    if (!existing) throw new NotFoundError('Farmer record not found');

    let updatedFarmer = existing;
    if (farmerUpdates) {
      const res = await farmersRepository.update(farmerId, farmerUpdates);
      if (res) updatedFarmer = res;
    }

    let updatedProfile = (await profilesRepository.findById(existing.profile_id))!;
    if (profileUpdates) {
      const res = await profilesRepository.update(existing.profile_id, profileUpdates);
      if (res) updatedProfile = res;
    }

    return { profile: updatedProfile, farmer: updatedFarmer };
  }
}

export const farmersService = new FarmersService();
