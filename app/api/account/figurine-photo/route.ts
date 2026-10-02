import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { accountConfig, sessionCookie } from '@/lib/server/account';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const config = accountConfig();
    const origin = request.headers.get('origin');
    if (request.headers.get('sec-fetch-site') === 'cross-site' || origin && origin !== config.origin) return new NextResponse(null, { status: 403 });
    const id = request.nextUrl.searchParams.get('id') || '', asset = request.nextUrl.searchParams.get('asset') || '';
    if (!/^[A-Za-z0-9_-]{8,100}$/.test(id) || !/^[A-Za-z0-9_-]{8,100}$/.test(asset)) return NextResponse.json({ message: 'Fotoğraf bulunamadı.' }, { status: 404 });
    const session = (await cookies()).get(sessionCookie())?.value || '';
    const response = await fetch(`${config.backend.replace(/\/$/, '')}/api/customer/figurine-photo/${encodeURIComponent(id)}/${encodeURIComponent(asset)}`, {
      cache: 'no-store', signal: AbortSignal.timeout(15000), headers: { 'x-customer-bff-key': config.secret, 'x-customer-session': session },
    });
    if (!response.ok) return new NextResponse(null, { status: response.status === 401 ? 401 : 404, headers: { 'Cache-Control': 'private, no-store' } });
    return new NextResponse(await response.arrayBuffer(), { status: 200, headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' } });
  } catch { return new NextResponse(null, { status: 503, headers: { 'Cache-Control': 'private, no-store' } }); }
}
