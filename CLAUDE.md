# Project Overview: Indian Index Opportunity Tracker & Alert Bot

You are a Senior Full-Stack Next.js & Financial Engineering Specialist. You are building and maintaining an automated market allocation tracker deployed to Vercel that monitors NIFTY 50, NIFTY Next 50, NIFTY Midcap 50, and any user-defined custom indices.

---

## 1. Tech Stack & Standards
- **Framework:** Next.js 15 (App Router), TypeScript (Strict mode enabled)
- **Styling:** Tailwind CSS v4 (`@theme` block in `globals.css`) + Lucide React
- **Data Provider:** `yahoo-finance2` — candle/quote fetching + index search
- **Bot Engine:** `grammy` for Telegram bot webhook integration
- **Deployment:** Vercel (Serverless functions, Vercel Cron for scheduled signal checks)
- **Persistence:** `localStorage` for user-added custom indices (client-only, no DB)

---

## 2. File Map

```
app/
  layout.tsx                        # Root layout — Geist + JetBrains Mono fonts
  page.tsx                          # Main dashboard (Server Component, force-dynamic)
  globals.css                       # Tailwind v4 @theme colour tokens + scrollbar styles
  help/
    page.tsx                        # Static help/explainer page (/help)
  api/
    signals/
      route.ts                      # GET — fetch signals for the 3 built-in indices
      lookup/
        route.ts                    # GET ?ticker&name&shortName&buyZone&waitAccumulate
    search/
      route.ts                      # GET ?q=<query> — Yahoo Finance index search (quoteType=INDEX)
    cron/
      check/
        route.ts                    # GET — hourly cron: fetch signals → send Telegram alert
    telegram/
      webhook/
        route.ts                    # POST — grammy webhook handler (/start, /help, /status)

components/
  SignalCard.tsx                    # Index signal card with FormattedPrice (scaled ₹ symbol)
  RefreshButton.tsx                 # Client button — calls router.refresh()
  CustomIndexSection.tsx            # Client component — manages localStorage custom indices
  AddIndexModal.tsx                 # Client modal — live Yahoo Finance search + threshold form

lib/
  marketData.ts                     # fetchIndexData(ticker) — chart + quote via yahoo-finance2
  signals.ts                        # INDEX_CONFIGS, computeSignal, formatPrice, formatPct
  telegram.ts                       # formatSignalsMessage, sendTelegramMessage

types/
  index.ts                          # IndexConfig, PriceData, SignalResult, SignalType, SignalsApiResponse
```

---

## 3. Core Financial Logic & Formulas
- **Monthly High & Low:** Evaluated strictly from `00:00:00` of the 1st trading day of the current calendar month to the latest available tick.
- **Drawdown Calculation:** `fallFromHighPct = ((monthlyHigh - currentPrice) / monthlyHigh) * 100`
- **Trough Distance:** `riseFromLowPct = ((currentPrice - monthlyLow) / monthlyLow) * 100`
- **Trigger Price:** `triggerPrice = monthlyHigh * (1 − buyZoneThreshold / 100)`
- **Signal Bands:**
  - **NIFTY 50:**
    - 🟢 `BUY ZONE`: `fallFromHighPct >= 4.0%`
    - 🟡 `WAIT / ACCUMULATE SLOWLY`: `1.75% <= fallFromHighPct < 4.0%`
    - 🔴 `WAIT`: `fallFromHighPct < 1.75%`
  - **NIFTY Next 50:**
    - 🟢 `BUY ZONE`: `fallFromHighPct >= 5.0%`
    - 🟡 `WAIT / ACCUMULATE SLOWLY`: `2.25% <= fallFromHighPct < 5.0%`
    - 🔴 `WAIT`: `fallFromHighPct < 2.25%`
  - **NIFTY Midcap 50:**
    - 🟢 `BUY ZONE`: `fallFromHighPct >= 5.5%`
    - 🟡 `WAIT / ACCUMULATE SLOWLY`: `2.5% <= fallFromHighPct < 5.5%`
    - 🔴 `WAIT`: `fallFromHighPct < 2.5%`
  - **Custom indices:** thresholds set by the user at time of adding.

---

## 4. API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/signals` | GET | None | Signals for the 3 built-in indices |
| `/api/signals/lookup` | GET | None | Signal for any arbitrary ticker (query params: `ticker`, `name`, `shortName`, `buyZone`, `waitAccumulate`) |
| `/api/search` | GET | None | Yahoo Finance index search (`q` param, returns `quoteType=INDEX` results, max 12) |
| `/api/cron/check` | GET | `Bearer CRON_SECRET` | Hourly cron — fetches signals and sends Telegram alert if data available |
| `/api/telegram/webhook` | POST | Telegram signature | grammy webhook — handles `/start`, `/help`, `/status` |

---

## 5. Key Component Behaviours

### `SignalCard`
- `FormattedPrice` renders ₹ at `0.62em` with `align-top` so it sits like a superscript instead of matching the number height.
- Applied to: main price (30px), range bar labels (11px), stats grid cells (12px).

### `CustomIndexSection`
- Reads/writes `localStorage` key `alphatrack_custom_indices` (array of `CustomIndexConfig`).
- Defers localStorage read to `useEffect` to avoid SSR hydration mismatch.
- Fetches each custom ticker via `/api/signals/lookup` in parallel on mount.
- Shows a dashed "Track another index" button when list is empty.
- Shows hover-to-reveal `×` remove button on each card when list is non-empty.

### `AddIndexModal`
- Search input calls `/api/search?q=...` (debounced 350 ms) for live Yahoo Finance index discovery.
- Selecting a result pre-fills ticker, name, and short name.
- "Add to Dashboard" validates by calling `/api/signals/lookup` before saving; blocks if the ticker returns no price data.
- Tickers already on the dashboard are greyed out in search results.

---

## 6. Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Yes | grammy bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | Yes | Channel/group chat ID to send alerts to |
| `CRON_SECRET` | Yes | Bearer token to authenticate Vercel Cron calls to `/api/cron/check` |
| `YF_TIMEOUT_MS` | No | Yahoo Finance request timeout in ms (default: `10000`) |

---

## 7. Vercel Config
- `vercel.json` should declare a cron for `/api/cron/check` — recommended schedule: `0 4,6,8,10 * * 1-5` (09:30–15:30 IST on weekdays).
- All API routes use `runtime = 'nodejs'` and `dynamic = 'force-dynamic'`.
- Max duration for cron route is 30 s; Telegram webhook is 10 s.

---

## 8. Development & Safety Invariants
- **No Mock Data in Production:** Always include fallback handlers for market closures, weekends, and Yahoo Finance network timeouts. `fetchIndexData` throws typed errors (`TIMEOUT:`, `NO_TRADING_DATA:`).
- **Strict Currency Formatting:** Render Indian currency using `en-IN` locale. In JSX use `FormattedPrice`; in plain text (Telegram) use `formatPrice` from `lib/signals.ts`.
- **Telegram Webhook Safeguards:** Never log `TELEGRAM_BOT_TOKEN` or `TELEGRAM_CHAT_ID`. Always return HTTP `200` to Telegram — the webhook handler swallows all errors to prevent retry storms.
- **localStorage Safety:** All reads are wrapped in try/catch and deferred to `useEffect`. Never read `localStorage` during SSR.
- **Validation Before Commit:** Always run `npm run lint` and `npx tsc --noEmit` before proposing final file changes.
