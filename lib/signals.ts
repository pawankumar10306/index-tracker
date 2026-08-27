import type { IndexConfig, PriceData, SignalResult, SignalType } from '@/types';

export const INDEX_CONFIGS: IndexConfig[] = [
  {
    ticker: '^NSEI',
    name: 'NIFTY 50',
    shortName: 'Nifty 50',
    thresholds: { buyZone: 4.0, waitAccumulate: 1.75 },
  },
  {
    ticker: '^NSMIDCP',
    name: 'NIFTY Next 50',
    shortName: 'Next 50',
    thresholds: { buyZone: 5.0, waitAccumulate: 2.25 },
  },
  {
    ticker: '^NSEMDCP50',
    name: 'NIFTY Midcap 50',
    shortName: 'Midcap 50',
    thresholds: { buyZone: 5.5, waitAccumulate: 2.5 },
  },
];

const SIGNAL_META: Record<SignalType, { label: string; emoji: string }> = {
  BUY_ZONE: { label: 'BUY ZONE', emoji: '🟢' },
  WAIT_ACCUMULATE: { label: 'WAIT / ACCUMULATE SLOWLY', emoji: '🟡' },
  WAIT: { label: 'WAIT', emoji: '🔴' },
};

export function computeSignal(config: IndexConfig, priceData: PriceData): SignalResult {
  const { currentPrice, monthlyHigh, monthlyLow, fetchedAt, dayChangePct, lowestClosePrice, lowestCloseDate, isLowestToday } = priceData;

  const fallFromHighPct =
    monthlyHigh > 0 ? ((monthlyHigh - currentPrice) / monthlyHigh) * 100 : 0;
  const riseFromLowPct =
    monthlyLow > 0 ? ((currentPrice - monthlyLow) / monthlyLow) * 100 : 0;
  const triggerPrice =
    monthlyHigh > 0 ? monthlyHigh * (1 - config.thresholds.buyZone / 100) : 0;

  let signal: SignalType;
  if (fallFromHighPct >= config.thresholds.buyZone) {
    signal = 'BUY_ZONE';
  } else if (fallFromHighPct >= config.thresholds.waitAccumulate) {
    signal = 'WAIT_ACCUMULATE';
  } else {
    signal = 'WAIT';
  }

  const { label: signalLabel, emoji: signalEmoji } = SIGNAL_META[signal];

  return {
    ticker: config.ticker,
    name: config.name,
    shortName: config.shortName,
    currentPrice,
    monthlyHigh,
    monthlyLow,
    fallFromHighPct,
    riseFromLowPct,
    triggerPrice,
    buyZoneThreshold: config.thresholds.buyZone,
    signal,
    signalLabel,
    signalEmoji,
    fetchedAt,
    dayChangePct,
    lowestClosePrice,
    lowestCloseDate,
    isLowestToday,
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatPct(pct: number): string {
  return `${Math.abs(pct).toFixed(2)}%`;
}
