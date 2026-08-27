import { Bot } from 'grammy';
import { INDEX_CONFIGS, computeSignal } from '@/lib/signals';
import { fetchIndexData } from '@/lib/marketData';
import { formatSignalsMessage } from '@/lib/telegram';
import type { SignalResult } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10;

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN ?? '');

bot.command('start', (ctx) =>
  ctx.reply(
    `👋 Welcome to <b>Indian Index Tracker</b>!\n\n` +
      `I monitor NIFTY 50, Next 50, and Midcap 50 for entry opportunities.\n\n` +
      `<b>Commands:</b>\n` +
      `/status — live signal for all 3 indices\n` +
      `/help — show this message`,
    { parse_mode: 'HTML' }
  )
);

bot.command('help', (ctx) =>
  ctx.reply(
    `<b>Available commands:</b>\n` +
      `/status — fetch live signals now\n` +
      `/help — show this help`,
    { parse_mode: 'HTML' }
  )
);

bot.command('status', async (ctx) => {
  const loading = await ctx.reply('⏳ Fetching live data…');

  try {
    const results = await Promise.allSettled(
      INDEX_CONFIGS.map((config) =>
        fetchIndexData(config.ticker, 8000)
      )
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

    const message = formatSignalsMessage(signals);
    await ctx.api.editMessageText(ctx.chat.id, loading.message_id, message, {
      parse_mode: 'HTML',
    });
  } catch {
    await ctx.api.editMessageText(
      ctx.chat.id,
      loading.message_id,
      '⚠️ Failed to fetch data. Please try again in a moment.'
    );
  }
});

bot.on('message', (ctx) =>
  ctx.reply('Unknown command. Try /help to see available commands.')
);

export async function POST(req: Request): Promise<Response> {
  try {
    const update = await req.json();
    await bot.handleUpdate(update);
  } catch {
    // Swallow all errors — never return non-200 to Telegram (causes retry storms)
  }
  return new Response('OK', { status: 200 });
}
