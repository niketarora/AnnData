import { roundToTwoDecimals } from './currency.js';

export interface NetRealizationInput {
  grossPricePerQuintal: number;
  quantityQuintals: number;
  distanceKm: number;
  freightRatePerKm?: number; // default ₹40/km
  mandiFeePercent?: number; // default 1.5%
  handlingFeeFlat?: number; // default ₹300 unloading/loading
  otherDeductions?: number;
}

export interface NetRealizationResult {
  grossAmount: number;
  freightCost: number;
  mandiFee: number;
  handlingFee: number;
  otherDeductions: number;
  totalDeductions: number;
  netPayout: number;
  netRatePerQuintal: number;
}

export function calculateNetRealization(input: NetRealizationInput): NetRealizationResult {
  const freightRate = input.freightRatePerKm ?? 40;
  const mandiFeePct = input.mandiFeePercent ?? 1.5;
  const handling = input.handlingFeeFlat ?? 300;
  const other = input.otherDeductions ?? 0;

  const grossAmount = roundToTwoDecimals(input.grossPricePerQuintal * input.quantityQuintals);
  const freightCost = roundToTwoDecimals(input.distanceKm * freightRate);
  const mandiFee = roundToTwoDecimals((grossAmount * mandiFeePct) / 100);
  const handlingFee = roundToTwoDecimals(handling);
  const otherDeductions = roundToTwoDecimals(other);

  const totalDeductions = roundToTwoDecimals(
    freightCost + mandiFee + handlingFee + otherDeductions
  );
  const netPayout = roundToTwoDecimals(Math.max(0, grossAmount - totalDeductions));
  const netRatePerQuintal =
    input.quantityQuintals > 0
      ? roundToTwoDecimals(netPayout / input.quantityQuintals)
      : 0;

  return {
    grossAmount,
    freightCost,
    mandiFee,
    handlingFee,
    otherDeductions,
    totalDeductions,
    netPayout,
    netRatePerQuintal,
  };
}
