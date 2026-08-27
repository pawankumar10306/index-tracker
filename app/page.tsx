import Link from 'next/link';
import { INDEX_CONFIGS, computeSignal, formatPct } from '@/lib/signals';
import { fetchIndexData } from '@/lib/marketData';
import { SignalCard } from '@/components/SignalCard';
import { RefreshButton } from '@/components/RefreshButton';
import { CustomIndexSection } from '@/components/CustomIndexSection';
import type { SignalResult } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function TelegramIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function getMarketStance(signals: SignalResult[]): string {
  const valid = signals.filter((s) => !s.error);
  if (valid.some((s) => s.signal === 'BUY_ZONE')) return 'Aggressive Accumulation';
  if (valid.some((s) => s.signal === 'WAIT_ACCUMULATE')) return 'Selective Accumulation';
  return 'Stay Patient';
}

const ERROR_RESULT = (config: (typeof INDEX_CONFIGS)[0], reason: unknown): SignalResult => ({
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
  error: reason instanceof Error ? reason.message : String(reason),
});

export default async function HomePage() {
  const results = await Promise.allSettled(
    INDEX_CONFIGS.map((config) => fetchIndexData(config.ticker))
  );

  const signals: SignalResult[] = results.map((result, i) => {
    const config = INDEX_CONFIGS[i];
    if (result.status === 'fulfilled') return computeSignal(config, result.value);
    return ERROR_RESULT(config, result.reason);
  });

  const valid = signals.filter((s) => !s.error);
  const buyZoneCount = valid.filter((s) => s.signal === 'BUY_ZONE').length;
  const avgDrawdown =
    valid.length > 0
      ? valid.reduce((sum, s) => sum + s.fallFromHighPct, 0) / valid.length
      : 0;
  const marketStance = getMarketStance(signals);
  const lastUpdated =
    valid.length > 0
      ? new Date(valid[0].fetchedAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Kolkata',
        })
      : null;

  const stanceColor =
    marketStance === 'Aggressive Accumulation'
      ? 'bg-primary-container'
      : marketStance === 'Selective Accumulation'
        ? 'bg-secondary-container'
        : 'bg-on-surface-variant';

  return (
    <div className="min-h-screen flex flex-col text-on-surface">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-outline-variant bg-surface/80 backdrop-blur-md">
        <div className="flex justify-between items-center px-6 h-14 max-w-[1440px] mx-auto w-full">
          <span
            className="text-[20px] font-bold text-primary tracking-tight"
            style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}
          >
            AlphaTrack
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/help"
              className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors hidden sm:block"
            >
              How it works
            </Link>
            <RefreshButton />
            <span
              className="hidden sm:block text-[12px] text-on-surface-variant flex items-center gap-1.5 px-2 py-1 rounded border border-outline-variant bg-surface-container"
              style={{ fontFamily: 'var(--font-jbm, monospace)', display: 'inline-flex' }}
            >
              <TelegramIcon className="w-3.5 h-3.5 shrink-0" style={{ color: '#2AABEE' }} />
              @Index_TrackerBot
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1 px-6 py-4 flex flex-col gap-4 max-w-[1440px] mx-auto w-full">
        {/* Market Overview Strip */}
        <section className="bg-surface-container-low border border-outline-variant rounded-lg p-3 flex flex-wrap items-center justify-between gap-4">
          <div className="glass-pill border border-outline-variant rounded-full px-4 py-1.5 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${stanceColor}`} />
            <span className="text-[13px] font-semibold text-on-surface">
              Market Stance: {marketStance}
            </span>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">
                Indices in Buy Zone
              </span>
              <span
                className="text-[18px] font-semibold text-on-surface leading-tight mt-0.5"
                style={{ fontFamily: 'var(--font-jbm, monospace)' }}
              >
                {buyZoneCount}/3
              </span>
            </div>
            <div className="w-px bg-outline-variant self-stretch" />
            {lastUpdated && (
              <>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">
                    Updated
                  </span>
                  <span
                    className="text-[18px] font-semibold text-on-surface leading-tight mt-0.5"
                    style={{ fontFamily: 'var(--font-jbm, monospace)' }}
                  >
                    {lastUpdated}
                  </span>
                </div>
                <div className="w-px bg-outline-variant self-stretch" />
              </>
            )}
            <div className="flex flex-col">
              <span className="text-[11px] uppercase font-bold text-on-surface-variant tracking-wider">
                Avg. Drawdown
              </span>
              <span
                className="text-[18px] font-semibold text-error leading-tight mt-0.5"
                style={{ fontFamily: 'var(--font-jbm, monospace)' }}
              >
                -{formatPct(avgDrawdown)}
              </span>
            </div>
          </div>
        </section>

        {/* Cards grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {signals.map((signal) => (
            <SignalCard key={signal.ticker} result={signal} />
          ))}
        </section>

        {/* Custom indices (client-side, persisted to localStorage) */}
        <CustomIndexSection />

        <p className="text-center text-on-surface-variant text-[11px] py-2">
          Data via Yahoo Finance · Not financial advice · For educational purposes only
        </p>
      </main>
    </div>
  );
}
