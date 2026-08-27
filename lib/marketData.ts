import YahooFinance from 'yahoo-finance2';
import type { ChartResultArray } from 'yahoo-finance2/modules/chart';
import type { Quote } from 'yahoo-finance2/modules/quote';
import type { PriceData } from '@/types';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

function getMonthStartDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function fetchIndexData(
  ticker: string,
  timeoutMs?: number
): Promise<PriceData> {
  const timeout = timeoutMs ?? parseInt(process.env.YF_TIMEOUT_MS ?? '10000', 10);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const period1 = getMonthStartDate();
    const fetchOptions = { signal: controller.signal };

    const chartResult = (await yahooFinance.chart(
      ticker,
      { period1, interval: '1d' },
      { fetchOptions, validateResult: false }
    )) as unknown as ChartResultArray;

    const quotes = chartResult?.quotes ?? [];
    if (quotes.length === 0) {
      throw new Error(`NO_TRADING_DATA: ${ticker}`);
    }

    const monthlyHigh = Math.max(...quotes.map((q) => q.high ?? 0));
    const monthlyLow = Math.min(...quotes.map((q) => q.low ?? Infinity));

    let lowestClosePrice = Infinity;
    let lowestCloseDate: string | undefined;
    for (const q of quotes) {
      const closeVal = q.adjclose ?? q.close;
      if (closeVal != null && closeVal < lowestClosePrice) {
        lowestClosePrice = closeVal;
        lowestCloseDate = new Date(q.date).toISOString().split('T')[0];
      }
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const isLowestToday = lowestCloseDate === todayStr;

    let currentPrice: number | undefined;
    let dayChangePct: number | undefined;
    try {
      const quoteResult = (await yahooFinance.quote(
        ticker,
        {},
        { fetchOptions, validateResult: false }
      )) as unknown as Quote;
      currentPrice = quoteResult?.regularMarketPrice;
      dayChangePct = quoteResult?.regularMarketChangePercent;
    } catch {
      // fall through to candle fallback
    }

    if (currentPrice === undefined || currentPrice === null) {
      const lastQuote = quotes[quotes.length - 1];
      currentPrice = lastQuote.close ?? lastQuote.adjclose ?? 0;
    }

    return {
      currentPrice: currentPrice ?? 0,
      monthlyHigh,
      monthlyLow,
      fetchedAt: new Date().toISOString(),
      dayChangePct,
      lowestClosePrice: lowestClosePrice === Infinity ? undefined : lowestClosePrice,
      lowestCloseDate,
      isLowestToday,
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`TIMEOUT: ${ticker}`);
    }
    if (err instanceof Error && err.message.startsWith('NO_TRADING_DATA')) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`${ticker}: ${msg}`);
  } finally {
    clearTimeout(timer);
  }
}
