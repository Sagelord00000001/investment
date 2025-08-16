import { NextResponse } from 'next/server';

const BASE = process.env.COINGECKO_BASE || "https://api.coingecko.com/api/v3";
const KEY = process.env.COINGECKO_API_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coin = searchParams.get('coin') || 'bitcoin';
    const days = searchParams.get('days') || '1';
    const currency = searchParams.get('currency') || 'usd';

    // Demo API has strict rate limits (10-30 calls/minute)
    const url = `${BASE}/coins/${coin}/market_chart?vs_currency=${currency}&days=${days}`;

    const res = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': KEY || '',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('CoinGecko API Error:', error);
      return NextResponse.json(
        { error: error.status?.error_message || 'API limit reached' },
        { status: 429 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}