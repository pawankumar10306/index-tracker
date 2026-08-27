import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export interface SearchResult {
  symbol: string;
  name: string;
  shortName: string;
  exchange: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<SearchResult[]>> {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  try {
    const raw = (await yahooFinance.search(q, {}, { validateResult: false })) as {
      quotes?: Array<{
        symbol?: string;
        quoteType?: string;
        longname?: string;
        shortname?: string;
        exchange?: string;
      }>;
    };

    const results: SearchResult[] = (raw.quotes ?? [])
      .filter((item) => item.quoteType === 'INDEX' && item.symbol)
      .slice(0, 12)
      .map((item) => ({
        symbol: item.symbol!,
        name: item.longname ?? item.shortname ?? item.symbol!,
        shortName: item.shortname ?? '',
        exchange: item.exchange ?? '',
      }));

    return NextResponse.json(results, {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  } catch {
    return NextResponse.json([]);
  }
}
