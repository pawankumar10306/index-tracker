import type { SignalResult } from '@/types';
import { formatPct } from '@/lib/signals';

function FormattedPrice({
  price,
  className,
  style,
}: {
  price: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const number = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
  return (
    <span className={className} style={style}>
      <span className="text-[0.62em] align-top mt-[0.28em] inline-block mr-[0.04em] opacity-75">₹</span>
      {number}
    </span>
  );
}

function formatSipDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

interface SignalCardProps {
  result: SignalResult;
}

const SIGNAL_CONFIG = {
  BUY_ZONE: {
    badge: 'border-primary-container/50 bg-primary-container/10 text-primary-container glow-green',
    dot: 'bg-primary-container',
    bar: 'bg-primary-container',
    accentBorder: 'border-t-primary-container',
    triggerColor: 'text-primary-container',
    drawdownColor: 'text-error',
    sipTodayColor: 'text-primary-container',
    label: 'BUY ZONE',
  },
  WAIT_ACCUMULATE: {
    badge: 'border-secondary-container/50 bg-secondary-container/10 text-secondary-container glow-amber',
    dot: 'bg-secondary-container',
    bar: 'bg-secondary-container',
    accentBorder: 'border-t-secondary-container',
    triggerColor: 'text-on-surface-variant',
    drawdownColor: 'text-secondary-container',
    sipTodayColor: 'text-secondary-container',
    label: 'ACCUMULATE',
  },
  WAIT: {
    badge: 'border-error/50 bg-error/10 text-error glow-red',
    dot: 'bg-error',
    bar: 'bg-on-surface-variant',
    accentBorder: 'border-t-error',
    triggerColor: 'text-on-surface-variant',
    drawdownColor: 'text-error',
    sipTodayColor: 'text-on-surface-variant',
    label: 'WAIT',
  },
};

export function SignalCard({ result }: SignalCardProps) {
  const cfg = SIGNAL_CONFIG[result.signal];

  if (result.error) {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[20px] font-semibold text-on-surface">{result.name}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant font-mono">
            {result.ticker}
          </span>
        </div>
        <p className="text-error text-[13px]">{result.error}</p>
      </div>
    );
  }

  const rangePosition =
    result.monthlyHigh > result.monthlyLow
      ? Math.min(
          100,
          Math.max(0, ((result.currentPrice - result.monthlyLow) / (result.monthlyHigh - result.monthlyLow)) * 100)
        )
      : 50;

  const dayChange = result.dayChangePct;

  const sipGapPct =
    result.lowestClosePrice !== undefined
      ? ((result.currentPrice - result.lowestClosePrice) / result.lowestClosePrice) * 100
      : 0;

  return (
    <div
      className={`bg-surface-container-low border border-outline-variant border-t-2 ${cfg.accentBorder} rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden`}
    >
      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[20px] font-semibold text-on-surface leading-tight">{result.name}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant font-mono shrink-0">
              {result.ticker}
            </span>
          </div>
          <FormattedPrice
            price={result.currentPrice}
            className="text-[30px] font-bold text-on-surface leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-jbm, monospace)' }}
          />
          {dayChange !== undefined && (
            <div
              className={`text-[13px] font-medium mt-1 flex items-center gap-1 ${dayChange >= 0 ? 'text-primary' : 'text-error'}`}
              style={{ fontFamily: 'var(--font-jbm, monospace)' }}
            >
              <span>{dayChange >= 0 ? '↑' : '↓'}</span>
              <span>
                {dayChange >= 0 ? '+' : ''}
                {dayChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div
          className={`shrink-0 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wider flex items-center gap-1.5 ${cfg.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${cfg.dot}`} />
          {cfg.label}
        </div>
      </div>

      {/* Range bar */}
      <div className="space-y-1.5">
        <div
          className="flex justify-between text-[11px] text-on-surface-variant"
          style={{ fontFamily: 'var(--font-jbm, monospace)' }}
        >
          <span><FormattedPrice price={result.monthlyLow} /> L</span>
          <span><FormattedPrice price={result.monthlyHigh} /> H</span>
        </div>
        <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-visible relative">
          <div
            className={`h-full ${cfg.bar} rounded-full relative`}
            style={{ width: `${rangePosition}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
          </div>
        </div>
      </div>

      {/* Stats: Drawdown | Trigger | Best SIP Day */}
      <div className="grid grid-cols-3 gap-px bg-outline-variant rounded-lg overflow-hidden">
        <div className="bg-surface-container-low p-2.5 flex flex-col gap-1">
          <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Drawdown</span>
          <span
            className={`text-[13px] font-semibold ${cfg.drawdownColor}`}
            style={{ fontFamily: 'var(--font-jbm, monospace)' }}
          >
            -{formatPct(result.fallFromHighPct)}
          </span>
        </div>
        <div className="bg-surface-container-low p-2.5 flex flex-col gap-1">
          <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">
            Trigger ({result.buyZoneThreshold}%)
          </span>
          <FormattedPrice
            price={result.triggerPrice}
            className={`text-[13px] font-semibold ${cfg.triggerColor}`}
            style={{ fontFamily: 'var(--font-jbm, monospace)' }}
          />
        </div>
        <div className="bg-surface-container-low p-2.5 flex flex-col gap-1">
          <span className="text-[10px] uppercase text-on-surface-variant font-semibold tracking-wider">Best SIP Day</span>
          {result.lowestCloseDate && result.lowestClosePrice !== undefined ? (
            result.isLowestToday ? (
              <span
                className={`text-[13px] font-bold ${cfg.sipTodayColor}`}
                style={{ fontFamily: 'var(--font-jbm, monospace)' }}
              >
                TODAY ↓
              </span>
            ) : (
              <span style={{ fontFamily: 'var(--font-jbm, monospace)' }}>
                <span className="text-[12px] text-on-surface">{formatSipDate(result.lowestCloseDate)}</span>
                <span className="text-[11px] text-on-surface-variant ml-1">+{sipGapPct.toFixed(2)}%</span>
              </span>
            )
          ) : (
            <span className="text-[13px] text-on-surface-variant">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
