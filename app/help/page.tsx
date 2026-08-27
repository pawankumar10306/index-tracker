import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works — AlphaTrack',
  description: 'Learn how AlphaTrack monitors NIFTY 50, Next 50, and Midcap 50 for monthly drawdown entry signals.',
};

const THRESHOLDS = [
  { name: 'NIFTY 50',      ticker: '^NSEI',      buyZone: '≥ 4.0%', accumulate: '1.75 – 3.99%', wait: '< 1.75%' },
  { name: 'NIFTY Next 50', ticker: '^NSMIDCP',   buyZone: '≥ 5.0%', accumulate: '2.25 – 4.99%', wait: '< 2.25%' },
  { name: 'NIFTY Midcap 50', ticker: '^NSEMDCP50', buyZone: '≥ 5.5%', accumulate: '2.5 – 5.49%',  wait: '< 2.5%'  },
];

const FAQ = [
  {
    q: 'Where does the data come from?',
    a: 'Live quotes and daily candles are fetched from Yahoo Finance. Data refreshes on demand (Refresh button) and via an automated hourly cron job on weekdays during NSE market hours.',
  },
  {
    q: 'How are Drawdown and Trigger Price calculated?',
    a: 'Drawdown = (Monthly High − Current Price) / Monthly High × 100. Trigger Price = Monthly High × (1 − Buy Zone Threshold / 100) — the exact price at which BUY ZONE activates. Monthly High and Low are measured from the first trading day of the current calendar month.',
  },
  {
    q: 'What is Best SIP Day?',
    a: 'The day this month with the lowest closing price — the cheapest NAV you could have bought at so far. "+X.XX% vs today" shows how much more expensive today is relative to that day. A "TODAY ↓" badge means today\'s close is currently the cheapest of the month.',
  },
  {
    q: 'How will I know when to act?',
    a: 'The Telegram bot sends an hourly alert during market hours with the current signal and Best SIP Day for each index. When today is the cheapest close of the month, the alert explicitly says so — no need to check the dashboard.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. AlphaTrack surfaces mechanical entry signals based on drawdown thresholds. Always do your own research and consult a registered financial advisor before investing.',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col text-on-surface">
      <nav className="sticky top-0 z-50 border-b border-outline-variant bg-surface/80 backdrop-blur-md">
        <div className="flex justify-between items-center px-6 h-14 max-w-[1440px] mx-auto w-full">
          <Link
            href="/"
            className="text-[20px] font-bold text-primary tracking-tight hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}
          >
            AlphaTrack
          </Link>
          <Link
            href="/"
            className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-6 py-8 flex flex-col gap-10 max-w-[720px] mx-auto w-full">

        {/* Intro */}
        <section className="flex flex-col gap-2">
          <h1
            className="text-[26px] font-bold text-on-surface leading-tight"
            style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}
          >
            How AlphaTrack Works
          </h1>
          <p className="text-[14px] text-on-surface-variant leading-relaxed">
            AlphaTrack watches NIFTY 50, Next 50, and Midcap 50. When an index
            pulls back far enough from its monthly high, it surfaces a signal telling you
            whether to buy, accumulate slowly, or wait.
          </p>
        </section>

        {/* Signals */}
        <section className="flex flex-col gap-4">
          <H2>Signals</H2>
          <p className="text-[13px] text-on-surface-variant leading-relaxed">
            Every signal comes from one number: <strong className="text-on-surface">drawdown</strong> — how far
            the current price has fallen from this month&apos;s peak. The deeper the pullback, the stronger the signal.
          </p>

          <div className="flex flex-col gap-2 text-[13px]">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-primary-container/30 bg-primary-container/5">
              <span className="w-2 h-2 rounded-full bg-primary-container mt-1 shrink-0" />
              <span><strong className="text-primary-container">BUY ZONE</strong> — drawdown hit the threshold. Good time to deploy capital.</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-secondary-container/30 bg-secondary-container/5">
              <span className="w-2 h-2 rounded-full bg-secondary-container mt-1 shrink-0" />
              <span><strong className="text-secondary-container">ACCUMULATE</strong> — pulling back but not there yet. Reasonable for a partial entry.</span>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-error/30 bg-error/5">
              <span className="w-2 h-2 rounded-full bg-error mt-1 shrink-0" />
              <span><strong className="text-error">WAIT</strong> — near the monthly high, minimal drawdown. Preserve capital for a better entry.</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-outline-variant">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <Th>Index</Th>
                  <Th className="text-primary-container">🟢 Buy Zone</Th>
                  <Th className="text-secondary-container">🟡 Accumulate</Th>
                  <Th className="text-error">🔴 Wait</Th>
                </tr>
              </thead>
              <tbody>
                {THRESHOLDS.map((row, i) => (
                  <tr
                    key={row.ticker}
                    className={`hover:bg-surface-container-low transition-colors ${i !== THRESHOLDS.length - 1 ? 'border-b border-outline-variant' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-on-surface">{row.name}</div>
                      <div className="text-[11px] text-on-surface-variant font-mono">{row.ticker}</div>
                    </td>
                    <td className="px-4 py-3 text-primary-container font-mono">{row.buyZone}</td>
                    <td className="px-4 py-3 text-secondary-container font-mono">{row.accumulate}</td>
                    <td className="px-4 py-3 text-error font-mono">{row.wait}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-on-surface-variant">
            Higher-beta indices need deeper pullbacks — a 3% dip in Midcap 50 is routine noise, not a signal.
          </p>
        </section>

        {/* Reading the dashboard */}
        <section className="flex flex-col gap-4">
          <H2>Reading the Dashboard</H2>
          <dl className="flex flex-col gap-0 divide-y divide-outline-variant border border-outline-variant rounded-lg overflow-hidden text-[13px]">
            {[
              { term: 'Drawdown',       def: 'How far the current price has fallen from this month\'s high — the core signal input.' },
              { term: 'Trigger Price',  def: 'The exact price level where BUY ZONE activates for this index.' },
              { term: 'Range Bar',      def: 'Visual position of today\'s price within the month\'s high–low range. Dot closer to L means deeper pullback.' },
              { term: 'Best SIP Day',   def: 'Day with the cheapest closing price this month. "+X%" = how much more today costs. "TODAY ↓" = today is the cheapest so far.' },
              { term: 'Market Stance',  def: 'Overview bar: Aggressive Accumulation (any index in BUY ZONE) · Selective Accumulation (any in ACCUMULATE) · Stay Patient (all WAIT).' },
              { term: 'Updated',        def: 'Time the last data fetch completed (IST). Hit Refresh to get a fresh quote.' },
            ].map(({ term, def }) => (
              <div key={term} className="flex gap-0">
                <dt className="w-36 shrink-0 px-4 py-3 font-semibold text-on-surface bg-surface-container-low border-r border-outline-variant">{term}</dt>
                <dd className="px-4 py-3 text-on-surface-variant leading-relaxed">{def}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* FAQ */}
        <section className="flex flex-col gap-3">
          <H2>FAQ</H2>
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden"
            >
              <summary className="px-4 py-3 cursor-pointer text-[13px] font-semibold text-on-surface select-none list-none flex justify-between items-center gap-3 hover:bg-surface-container transition-colors">
                {item.q}
                <span className="text-on-surface-variant text-[18px] leading-none group-open:rotate-45 transition-transform duration-200 shrink-0">+</span>
              </summary>
              <p className="px-4 pb-4 pt-2 text-[13px] text-on-surface-variant leading-relaxed border-t border-outline-variant">
                {item.a}
              </p>
            </details>
          ))}
        </section>

        <p className="text-center text-on-surface-variant text-[11px] py-2">
          Data via Yahoo Finance · Not financial advice · Educational purposes only
        </p>
      </main>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[17px] font-bold text-on-surface"
      style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}
    >
      {children}
    </h2>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left text-[11px] uppercase font-bold tracking-wider text-on-surface-variant ${className ?? ''}`}>
      {children}
    </th>
  );
}
