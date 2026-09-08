export interface RealizationParams {
  grossPricePerQuintal: number;
  quantityQuintals: number;
  distanceKm: number;
  transportRatePerKm?: number; // default ₹25/km for tractor trolley
  freightRatePerKm?: number; // alias
  mandiCessRatePercent?: number; // default 0.8%
  mandiFeePercent?: number; // alias
  waitingCostPerHour?: number; // opportunity cost of waiting: ~₹150/hr
  waitingMinutes?: number;
  handlingFeeFlat?: number;
}

export interface RealizationResult {
  grossRevenue: number;
  grossAmount: number;
  transportCost: number;
  freightCost: number;
  mandiDeduction: number;
  mandiFee: number;
  waitingCost: number;
  handlingFee: number;
  totalDeductions: number;
  netRealization: number;
  netPayout: number;
  netRatePerQuintal: number;
}

export function calculateNetRealization(params: RealizationParams): RealizationResult {
  const {
    grossPricePerQuintal,
    quantityQuintals,
    distanceKm,
    transportRatePerKm = params.freightRatePerKm ?? 25,
    mandiCessRatePercent = params.mandiFeePercent ?? 0.8,
    waitingCostPerHour = 150,
    waitingMinutes = params.handlingFeeFlat ? 0 : 30,
    handlingFeeFlat = 0,
  } = params;

  const grossRevenue = grossPricePerQuintal * quantityQuintals;
  const transportCost = Math.round(distanceKm * transportRatePerKm);
  const mandiDeduction = Math.round((grossRevenue * mandiCessRatePercent) / 100);
  const waitingCost = handlingFeeFlat > 0 ? handlingFeeFlat : Math.round((waitingMinutes / 60) * waitingCostPerHour);

  const totalDeductions = transportCost + mandiDeduction + waitingCost;
  const netRealization = Math.max(0, grossRevenue - totalDeductions);
  const netRatePerQuintal = quantityQuintals > 0 ? Number((netRealization / quantityQuintals).toFixed(1)) : 0;

  return {
    grossRevenue,
    grossAmount: grossRevenue,
    transportCost,
    freightCost: transportCost,
    mandiDeduction,
    mandiFee: mandiDeduction,
    waitingCost,
    handlingFee: waitingCost,
    totalDeductions,
    netRealization,
    netPayout: netRealization,
    netRatePerQuintal: Math.round(netRatePerQuintal),
  };
}
