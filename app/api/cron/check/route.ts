import { NextResponse } from 'next/server';
import { INDEX_CONFIGS, computeSignal } from '@/lib/signals';
import { fetchIndexData } from '@/lib/marketData';
import { formatSignalsMessage, sendTelegramMessage } from '@/lib/telegram';
import type { SignalResult } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get('Authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
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
    const hasAnyData = signals.some((s) => !s.error);

    if (hasAnyData) {
      const message = formatSignalsMessage(signals);
      await sendTelegramMessage(message);
    }

    return NextResponse.json({ ok: true, signalsCount: signals.length, partial });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message });
  }
}
