import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const unavailable = (code: string, status = 503) => NextResponse.json(
  { message: 'Paket bilgileri şu anda yüklenemiyor. Talep gönderimi kapalıdır.', code },
  { status, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } },
);

export async function GET() {
  const backend = process.env.CUSTOMER_STRAPI_INTERNAL_URL || process.env.NEXT_PUBLIC_STRAPI_URL || process.env.BACKEND_PROXY_URL;
  if (!backend) return unavailable('FIGURINE_CATALOG_BACKEND_URL_MISSING');
  try {
    const response = await fetch(`${backend.replace(/\/$/, '')}/api/figurine-package/catalog`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return unavailable('FIGURINE_CATALOG_BACKEND_ERROR', 502);
    const body = await response.json();
    if (!body || !Array.isArray(body.packages)) return unavailable('FIGURINE_CATALOG_INVALID_RESPONSE', 502);
    return NextResponse.json(body, { headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });
  } catch {
    // Do not log request data, credentials, backend URLs, or provider errors.
    console.error('[figurine-catalog] backend_unreachable');
    return unavailable('FIGURINE_CATALOG_BACKEND_UNREACHABLE', 503);
  }
}
