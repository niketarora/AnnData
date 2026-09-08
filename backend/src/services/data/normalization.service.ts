/**
 * Agricultural Data Normalization Service
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 8 & 42: Data Validation and Normalization Pipeline
 */

import { MarketDataRecord } from '../../integrations/market/marketDataProvider.interface.js';

export interface NormalizedMarketRecord {
  marketId: string;
  marketCode: string;
  marketName: string;
  district: string;
  state: string;
  commodity: string;
  variety: string;
  minPricePerQuintal: number;
  maxPricePerQuintal: number;
  modalPricePerQuintal: number;
  arrivalsQuintals: number;
  observedAt: string;
  receivedAt: string;
  expiresAt: string;
  source: string;
  sourceRecordId: string;
}

export class NormalizationService {
  /**
   * Normalizes raw market records to standard units (INR/Quintal, Quintals arrival volume)
   */
  public normalizeMarketRecord(record: MarketDataRecord): NormalizedMarketRecord {
    const observedDate = new Date(record.observedAt);
    const validObservedAt = isNaN(observedDate.getTime()) ? new Date().toISOString() : observedDate.toISOString();
    
    // Default expiration for Mandi wholesale rates: 60 minutes
    const expiresAt = new Date(new Date(validObservedAt).getTime() + 60 * 60 * 1000).toISOString();

    const minPrice = Math.max(0, Math.round(Number(record.minPrice) || 0));
    const maxPrice = Math.max(minPrice, Math.round(Number(record.maxPrice) || minPrice));
    const modalPrice = Math.max(minPrice, Math.min(maxPrice, Math.round(Number(record.modalPrice) || minPrice)));
    const arrivals = Math.max(0, Math.round(Number(record.arrivalsQuintals) || 0));

    return {
      marketId: String(record.marketId || '').trim(),
      marketCode: String(record.marketCode || 'APMC').trim().toUpperCase(),
      marketName: String(record.marketName || 'Mandi Yard').trim(),
      district: String(record.district || '').trim(),
      state: String(record.state || 'Haryana').trim(),
      commodity: String(record.commodity || 'Wheat').trim(),
      variety: String(record.variety || 'Standard').trim(),
      minPricePerQuintal: minPrice,
      maxPricePerQuintal: maxPrice,
      modalPricePerQuintal: modalPrice,
      arrivalsQuintals: arrivals,
      observedAt: validObservedAt,
      receivedAt: new Date().toISOString(),
      expiresAt,
      source: record.source || 'UnknownProvider',
      sourceRecordId: record.sourceRecordId || `${record.marketCode}-${record.commodity}-${Date.now()}`,
    };
  }

  /**
   * Validates required fields and numerical bounds
   */
  public validate(record: MarketDataRecord): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!record.commodity || typeof record.commodity !== 'string') {
      errors.push('Missing or invalid commodity');
    }
    if (typeof record.modalPrice !== 'number' || record.modalPrice <= 0 || isNaN(record.modalPrice)) {
      errors.push('modalPrice must be a positive number');
    }
    if (record.minPrice > record.maxPrice) {
      errors.push('minPrice cannot exceed maxPrice');
    }
    if (!record.marketName) {
      errors.push('Missing marketName');
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const normalizationService = new NormalizationService();
