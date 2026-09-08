import { DepartureState } from '../types/index.js';

export interface QueueEstimateInput {
  lotsAhead: number;
  avgMinutesPerLot?: number; // default 12 mins
  activeCounters?: number; // default 4 counters
  delayMinutes?: number; // operator added delay
  travelEtaMinutes?: number; // farmer travel time
  safetyBufferMinutes?: number; // buffer, default 10 mins
}

export interface QueueEstimateResult {
  processingDelayMinutes: number;
  totalEstimatedWaitMinutes: number;
  recommendedDepartureState: DepartureState;
  departureRecommendationText: string;
  formattedEstimatedWait: string;
}

export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 min';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function calculateQueueEstimate(input: QueueEstimateInput): QueueEstimateResult {
  const lotsAhead = Math.max(0, input.lotsAhead);
  const avgMins = input.avgMinutesPerLot ?? 12;
  const counters = Math.max(1, input.activeCounters ?? 4);
  const delay = Math.max(0, input.delayMinutes ?? 0);
  const travelEta = Math.max(0, input.travelEtaMinutes ?? 20);
  const buffer = input.safetyBufferMinutes ?? 10;

  // lots_ahead * avg_processing_time / active_counters
  const processingDelay = Math.ceil((lotsAhead * avgMins) / counters);
  const totalWait = processingDelay + delay;

  // Time until lot will be processed
  const timeUntilService = totalWait;

  let departureState: DepartureState = 'WAIT';
  let departureText = 'Wait at farm. Gate congestion reported.';

  if (delay > 0) {
    departureState = 'WAIT';
    departureText = `Mandi delay +${delay}m. Remain at farm.`;
  } else if (timeUntilService <= travelEta + buffer) {
    departureState = 'LEAVE_NOW';
    departureText = 'Gate cleared! Proceed to Mandi now.';
  } else if (timeUntilService <= travelEta + buffer + 20) {
    departureState = 'GET_READY';
    departureText = 'Prepare vehicle and documentation. Departing soon.';
  } else {
    departureState = 'WAIT';
    departureText = `Wait at farm. Estimated wait ${formatMinutes(totalWait)}.`;
  }

  return {
    processingDelayMinutes: processingDelay,
    totalEstimatedWaitMinutes: totalWait,
    recommendedDepartureState: departureState,
    departureRecommendationText: departureText,
    formattedEstimatedWait: formatMinutes(totalWait),
  };
}
