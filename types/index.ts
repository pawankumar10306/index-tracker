export interface IndexConfig {
  ticker: string;
  name: string;
  shortName: string;
  thresholds: {
    buyZone: number;
    waitAccumulate: number;
  };
}

export interface PriceData {
  currentPrice: number;
  monthlyHigh: number;
  monthlyLow: number;
  fetchedAt: string;
  dayChangePct?: number;
  lowestClosePrice?: number;
  lowestCloseDate?: string;
  isLowestToday?: boolean;
}

export type SignalType = 'BUY_ZONE' | 'WAIT_ACCUMULATE' | 'WAIT';

export interface SignalResult {
  ticker: string;
  name: string;
  shortName: string;
  currentPrice: number;
  monthlyHigh: number;
  monthlyLow: number;
  fallFromHighPct: number;
  riseFromLowPct: number;
  triggerPrice: number;
  buyZoneThreshold: number;
  signal: SignalType;
  signalLabel: string;
  signalEmoji: string;
  fetchedAt: string;
  dayChangePct?: number;
  lowestClosePrice?: number;
  lowestCloseDate?: string;
  isLowestToday?: boolean;
  error?: string;
}

export interface SignalsApiResponse {
  signals: SignalResult[];
  computedAt: string;
  partial: boolean;
}
