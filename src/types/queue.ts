export type DepartureState = 'WAIT' | 'GET_READY' | 'LEAVE_NOW' | 'ARRIVED' | 'DELAYED';

export interface JourneyStep {
  stepNumber: number;
  label: string;
  sublabel: string;
  icon: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface LiveQueueState {
  tokenNumber: string;
  currentServingToken: string;
  lotsAhead: number;
  totalQueueLoad: number;
  estimatedWeighmentTime: string;
  avgLotClearMinutes: number;
  departureState: DepartureState;
  delayMinutes: number;
  revisedDepartureTime: string;
  gateNotice: {
    time: string;
    message: string;
  };
  journeySteps: JourneyStep[];
  activeCounter: string;
  lastUpdated: string;
}
