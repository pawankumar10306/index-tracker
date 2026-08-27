import { NextRequest, NextResponse } from 'next/server';
import { computeSignal } from '@/lib/signals';
import { fetchIndexData } from '@/lib/marketData';
import type { IndexConfig, SignalResult } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse<SignalResult>> {
  const sp = req.nextUrl.searchParams;
  const ticker = sp.get('ticker')?.trim();
  const name = sp.get('name')?.trim();
  const shortName = sp.get('shortName')?.trim() ?? name;
  const buyZone = parseFloat(sp.get('buyZone') ?? '');
  const waitAccumulate = parseFloat(sp.get('waitAccumulate') ?? '');

  if (!ticker || !name || isNaN(buyZone) || isNaN(waitAccumulate)) {
    return NextResponse.json(
      {
        ticker: ticker ?? '',
        name: name ?? '',
        shortName: shortName ?? '',
        currentPrice: 0,
        monthlyHigh: 0,
        monthlyLow: 0,
        fallFromHighPct: 0,
        riseFromLowPct: 0,
        triggerPrice: 0,
        buyZoneThreshold: buyZone || 0,
        signal: 'WAIT',
        signalLabel: 'WAIT',
        signalEmoji: '🔴',
        fetchedAt: new Date().toISOString(),
        error: 'Missing required params: ticker, name, buyZone, waitAccumulate',
      } satisfies SignalResult,
      { status: 400 }
    );
  }

  const config: IndexConfig = {
    ticker,
    name,
    shortName: shortName ?? name,
    thresholds: { buyZone, waitAccumulate },
  };

  try {
    const priceData = await fetchIndexData(ticker);
    const signal = computeSignal(config, priceData);
    return NextResponse.json(signal, {
      headers: { 'Cache-Control': 'no-store, no-cache' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ticker,
        name,
        shortName: shortName ?? name,
        currentPrice: 0,
        monthlyHigh: 0,
        monthlyLow: 0,
        fallFromHighPct: 0,
        riseFromLowPct: 0,
        triggerPrice: 0,
        buyZoneThreshold: buyZone,
        signal: 'WAIT',
        signalLabel: 'WAIT',
        signalEmoji: '🔴',
        fetchedAt: new Date().toISOString(),
        error: message,
      } satisfies SignalResult
    );
  }
}
