import { DepartureState } from '../types';

export interface QueueEstimateParams {
  lotsAhead: number;
  avgProcessingMinutes: number;
  activeCounters: number;
  travelEtaMinutes: number;
  safetyBufferMinutes?: number;
  currentMarketDelayMinutes?: number;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function calculateQueueEstimate(params: {
  lotsAhead: number;
  avgMinutesPerLot?: number;
  delayMinutes?: number;
}): {
  totalEstimatedMinutes: number;
  formattedTime: string;
} {
  const lotsAhead = params.lotsAhead || 0;
  const avg = params.avgMinutesPerLot || 12;
  const delay = params.delayMinutes || 0;
  const totalEstimatedMinutes = lotsAhead * avg + delay;
  return {
    totalEstimatedMinutes,
    formattedTime: formatMinutes(totalEstimatedMinutes),
  };
}

export function calculateProcessingDelay(lotsAhead: number, avgProcessingMinutes: number, activeCounters: number): number {
  if (activeCounters <= 0) return 0;
  return Math.round((lotsAhead * avgProcessingMinutes) / activeCounters);
}

export function determineDepartureState(params: QueueEstimateParams): {
  departureState: DepartureState;
  estimatedWaitMinutes: number;
  departureEtaNotice: string;
} {
  const {
    lotsAhead,
    avgProcessingMinutes,
    activeCounters,
    travelEtaMinutes,
    safetyBufferMinutes = 10,
    currentMarketDelayMinutes = 0,
  } = params;

  const queueDelay = calculateProcessingDelay(lotsAhead, avgProcessingMinutes, activeCounters);
  const totalWaitMinutes = queueDelay + currentMarketDelayMinutes;
  const timeUntilNeeded = totalWaitMinutes - travelEtaMinutes - safetyBufferMinutes;

  if (currentMarketDelayMinutes > 30 || timeUntilNeeded > 25) {
    return {
      departureState: 'WAIT',
      estimatedWaitMinutes: totalWaitMinutes,
      departureEtaNotice: `Delay: ~${totalWaitMinutes} min. Rest at farm shed.`,
    };
  } else if (timeUntilNeeded > 10) {
    return {
      departureState: 'GET_READY',
      estimatedWaitMinutes: totalWaitMinutes,
      departureEtaNotice: `Prepare tractor. Departure recommended in ${Math.round(timeUntilNeeded)} mins.`,
    };
  } else {
    return {
      departureState: 'LEAVE_NOW',
      estimatedWaitMinutes: totalWaitMinutes,
      departureEtaNotice: `Travel now (~${travelEtaMinutes} min transit). Gate Express Line awaiting.`,
    };
  }
}
