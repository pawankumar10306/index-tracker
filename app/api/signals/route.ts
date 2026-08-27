import { NextResponse } from 'next/server';
import { INDEX_CONFIGS, computeSignal } from '@/lib/signals';
import { fetchIndexData } from '@/lib/marketData';
import type { SignalResult, SignalsApiResponse } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse<SignalsApiResponse>> {
  const results = await Promise.allSettled(
    INDEX_CONFIGS.map((config) => fetchIndexData(config.ticker))
  );

  const signals: SignalResult[] = results.map((result, i) => {
    const config = INDEX_CONFIGS[i];
    if (result.status === 'fulfilled') {
      return computeSignal(config, result.value);
    }
    return {
      ticker: config.ticker,
      name: config.name,
      shortName: config.shortName,
      currentPrice: 0,
      monthlyHigh: 0,
      monthlyLow: 0,
      fallFromHighPct: 0,
      riseFromLowPct: 0,
      triggerPrice: 0,
      buyZoneThreshold: config.thresholds.buyZone,
      signal: 'WAIT',
      signalLabel: 'WAIT',
      signalEmoji: '🔴',
      fetchedAt: new Date().toISOString(),
      error: result.reason instanceof Error ? result.reason.message : String(result.reason),
    } satisfies SignalResult;
  });

  const partial = results.some((r) => r.status === 'rejected');

  return NextResponse.json(
    { signals, computedAt: new Date().toISOString(), partial },
    {
      headers: { 'Cache-Control': 'no-store, no-cache' },
    }
  );
}
