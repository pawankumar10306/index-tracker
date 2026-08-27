import type { SignalResult } from '@/types';
import { formatPrice, formatPct } from '@/lib/signals';

export function formatSignalsMessage(signals: SignalResult[]): string {
  const now = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const lines: string[] = [
    `📊 <b>NIFTY Market Signal Update</b>`,
    `🕐 <i>${now} IST</i>`,
    ``,
  ];

  for (const s of signals) {
    lines.push(`━━━━━━━━━━━━━━━━━`);
    if (s.error) {
      lines.push(`${s.signalEmoji} <b>${s.name}</b> — ⚠️ Data unavailable`);
      lines.push(`<i>${s.error}</i>`);
    } else {
      lines.push(`${s.signalEmoji} <b>${s.name}</b> — ${s.signalLabel}`);
      lines.push(`💰 Current: ${formatPrice(s.currentPrice)}`);
      lines.push(`📈 Month High: ${formatPrice(s.monthlyHigh)}  ↓ ${formatPct(s.fallFromHighPct)} from high`);
      lines.push(`📉 Month Low:  ${formatPrice(s.monthlyLow)}  ↑ ${formatPct(s.riseFromLowPct)} from low`);
      if (s.lowestCloseDate && s.lowestClosePrice !== undefined) {
        const dateLabel = new Date(s.lowestCloseDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        if (s.isLowestToday) {
          lines.push(`📅 SIP: Today is the cheapest close this month — ${formatPrice(s.lowestClosePrice)} ✅`);
        } else {
          const gapPct = (((s.currentPrice - s.lowestClosePrice) / s.lowestClosePrice) * 100).toFixed(2);
          lines.push(`📅 Best SIP day: ${dateLabel} at ${formatPrice(s.lowestClosePrice)}  (+${gapPct}% vs today)`);
        }
      }
    }
    lines.push(``);
  }

  lines.push(`<i>Data via Yahoo Finance</i>`);
  return lines.join('\n');
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('Telegram env vars not configured');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const description = (body as { description?: string }).description ?? 'Unknown error';
      throw new Error(`Telegram API error: ${description}`);
    }
  } finally {
    clearTimeout(timer);
  }
}
