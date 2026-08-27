# AlphaTrack — Indian Index Opportunity Tracker

A real-time dashboard that monitors **NIFTY 50, NIFTY Next 50, and NIFTY Midcap 50** (plus any custom indices you add) for monthly drawdown-based entry signals. A Telegram bot delivers instant alerts when an index crosses into a buy zone.

---

## Features

- **Live signal cards** — current price, monthly high/low, drawdown %, and signal band for each index
- **Three signal states** — BUY ZONE (🟢), WAIT / ACCUMULATE SLOWLY (🟡), WAIT (🔴), with colour-coded glow and reasoning
- **Market Stance banner** — summarises the combined signal across all tracked indices
- **Custom indices** — add any Yahoo Finance index ticker (NIFTY Bank, NIFTY IT, BSE Sensex, …) via live search; thresholds are configurable; persisted in localStorage
- **Live index search** — powered by `yahoo-finance2`'s search API; type to discover any index by name
- **Telegram bot alerts** — hourly cron sends signal updates to a configured channel; `/status` command for on-demand updates
- **Help page** — `/help` explains signals, thresholds, and all card fields to new users

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v4 + Lucide React |
| Data | `yahoo-finance2` (quotes, charts, index search) |
| Bot | `grammy` (Telegram webhook) |
| Deployment | Vercel (Serverless + Cron) |
| State | `localStorage` for custom indices (no database) |

---

## Getting Started

```bash
git clone <repo>
cd index_tracker
npm install
cp .env.example .env.local   # fill in the vars below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create `.env.local` (never commit this file):

```env
# Telegram bot token from @BotFather
TELEGRAM_BOT_TOKEN=123456:ABC-your-token

# Chat ID of the channel/group to send alerts to
# Use @username for public channels, or get the numeric ID via getUpdates
TELEGRAM_CHAT_ID=-1001234567890

# Secret token to authenticate Vercel Cron calls to /api/cron/check
CRON_SECRET=your-random-secret-string

# Optional: Yahoo Finance request timeout in milliseconds (default: 10000)
# YF_TIMEOUT_MS=10000
```

---

## Vercel Deployment

1. Push to GitHub and import the repo in the Vercel dashboard.
2. Set all environment variables above in **Settings → Environment Variables**.
3. Add a cron job in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check",
      "schedule": "0 4,6,8,10 * * 1-5"
    }
  ]
}
```

This fires at 09:30, 11:30, 13:30, and 15:30 IST on weekdays (UTC+5:30 offset applied). The cron route is protected by `Authorization: Bearer CRON_SECRET`.

4. Register the Telegram webhook once after deployment:

```
https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.vercel.app/api/telegram/webhook
```

---

## Signal Logic

Signals are driven by a single metric: how far the current price has fallen from the monthly high (drawdown from the 1st trading day of the month).

| Index | 🟢 BUY ZONE | 🟡 ACCUMULATE | 🔴 WAIT |
|---|---|---|---|
| NIFTY 50 | ≥ 4.0% | 1.75% – 3.99% | < 1.75% |
| NIFTY Next 50 | ≥ 5.0% | 2.25% – 4.99% | < 2.25% |
| NIFTY Midcap 50 | ≥ 5.5% | 2.50% – 5.49% | < 2.50% |
| Custom indices | user-defined | user-defined | user-defined |

Higher-beta indices require deeper drawdowns because they oscillate more on normal trading days.

---

## Project Structure

```
app/
  page.tsx                  # Main dashboard (Server Component)
  help/page.tsx             # Static help/explainer page
  globals.css               # Tailwind v4 theme tokens
  api/
    signals/route.ts        # GET — built-in index signals
    signals/lookup/route.ts # GET — arbitrary ticker signal
    search/route.ts         # GET — Yahoo Finance index search
    cron/check/route.ts     # GET — hourly Telegram alert (cron-protected)
    telegram/webhook/route.ts # POST — grammy bot webhook

components/
  SignalCard.tsx            # Card with scaled ₹ symbol (FormattedPrice)
  RefreshButton.tsx         # Client-side router.refresh() trigger
  CustomIndexSection.tsx    # localStorage custom index management
  AddIndexModal.tsx         # Live search + threshold form modal

lib/
  marketData.ts             # fetchIndexData — chart + quote via yahoo-finance2
  signals.ts                # INDEX_CONFIGS, computeSignal, formatPrice, formatPct
  telegram.ts               # formatSignalsMessage, sendTelegramMessage

types/index.ts              # Shared TypeScript types
```

---

## Telegram Bot Commands

| Command | Description |
|---|---|
| `/start` | Welcome message and command list |
| `/status` | Fetch live signals for all 3 built-in indices right now |
| `/help` | Show available commands |

---

## Disclaimer

Data via Yahoo Finance. This tool is for educational and informational purposes only. It does not constitute financial advice. Always consult a registered financial advisor before making investment decisions.
