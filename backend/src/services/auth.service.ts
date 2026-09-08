import { profilesRepository } from '../repositories/profiles.repository.js';
import { farmersRepository } from '../repositories/farmers.repository.js';
import { buyersRepository } from '../repositories/buyers.repository.js';
import { Profile, Farmer, Buyer, AuthContext } from '../types/index.js';
import { NotFoundError } from '../utils/errors.js';

export class AuthService {
  async getCurrentUserProfile(authContext: AuthContext): Promise<{
    profile: Profile;
    farmer?: Farmer | null;
    buyer?: Buyer | null;
  }> {
    const profile = await profilesRepository.findById(authContext.profileId);
    if (!profile) {
      throw new NotFoundError('User profile not found');
    }

    let farmer: Farmer | null = null;
    let buyer: Buyer | null = null;

    if (profile.role === 'farmer') {
      farmer = await farmersRepository.findByProfileId(profile.id);
    } else if (profile.role === 'buyer') {
      buyer = await buyersRepository.findByProfileId(profile.id);
    }

    return { profile, farmer, buyer };
  }
}

export const authService = new AuthService();
