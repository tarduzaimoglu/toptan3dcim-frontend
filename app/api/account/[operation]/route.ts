import { NextRequest, NextResponse } from 'next/server';
import { accountBackend, accountConfig, cookieOptions, sessionCookie, csrfCookie } from '@/lib/server/account';
import { csrfTicket, validCsrf, validOrigin } from '@/lib/server/account-security';
import crypto from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const readOperations = new Set(['me', 'addresses', 'orders', 'order', 'cart', 'figurine-packages', 'figurine-requests', 'figurine-request', 'figurine-return-list', 'communication-preferences']);
const writeOperations = new Set(['register', 'login', 'logout', 'forgot', 'resend', 'verify', 'reset', 'profile', 'email-change', 'address-save', 'address-delete', 'cart-save', 'cart-merge', 'checkout-quote', 'checkout', 'payment-result', 'figurine-draft', 'figurine-upload-sign', 'figurine-upload-complete', 'figurine-submit', 'figurine-offer-accept', 'figurine-change-request', 'figurine-convert-order', 'figurine-start-payment', 'figurine-return-submit', 'communication-preferences-save', 'account-delete-request', 'claim-guest-order', 'claim-order-verify']);
const guestCookie = () => process.env.NODE_ENV === 'production' ? '__Host-checkout-guest' : 'checkout-guest';
type Context = { params: Promise<{ operation: string }> };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' } });

function clientKey(request: NextRequest) {
  // Enable only behind a proxy which overwrites (not appends client-supplied) this header.
  const header = process.env.CUSTOMER_TRUSTED_CLIENT_IP_HEADER;
  return header ? request.headers.get(header)?.trim() || 'unknown' : 'untrusted-proxy';
}
export async function GET(request: NextRequest, context: Context) {
  try {
    const { operation } = await context.params;
    if (operation === 'csrf') {
      if (request.headers.get('sec-fetch-site') === 'cross-site') return json({ message: 'İstek reddedildi.' }, 403);
      const config = accountConfig();
      const session = request.cookies.get(sessionCookie())?.value || '', existing = request.cookies.get(csrfCookie())?.value || '';
      const token = validCsrf(existing, existing, config.secret, session) ? existing : csrfTicket(config.secret, session);
      const response = json({ token }); response.cookies.set(csrfCookie(), token, { ...cookieOptions, maxAge: 3600 });
      if (!request.cookies.get(guestCookie())?.value) response.cookies.set(guestCookie(), crypto.randomBytes(32).toString('base64url'), { ...cookieOptions, maxAge: 604800 });
      return response;
    }
    if (!readOperations.has(operation)) return json({ message: 'Bulunamadı.' }, 404);
    const data = operation === 'payment-result' ? { orderNumber: request.nextUrl.searchParams.get('order'), guestKey: request.cookies.get(guestCookie())?.value || '' } : operation === 'order' || operation === 'figurine-request' ? { id: request.nextUrl.searchParams.get('id') } : operation === 'orders' ? { page: request.nextUrl.searchParams.get('page') || 1 } : {};
    const result = await accountBackend(operation, data, request.cookies.get(sessionCookie())?.value || '', clientKey(request));
    const response = json(result.body, result.status);
    if (result.status === 401) response.cookies.set(sessionCookie(), '', { ...cookieOptions, maxAge: 0 });
    return response;
  } catch { return json({ message: 'Hesap hizmetine şu anda erişilemiyor.' }, 503); }
}
export async function POST(request: NextRequest, context: Context) {
  try {
    const { operation } = await context.params;
    if (!writeOperations.has(operation)) return json({ message: 'Bulunamadı.' }, 404);
    const config = accountConfig();
    const session = request.cookies.get(sessionCookie())?.value || '';
    if (!validOrigin(request.headers.get('origin'), config.origin, request.headers.get('sec-fetch-site')) ||
      !validCsrf(request.cookies.get(csrfCookie())?.value || '', request.headers.get('x-csrf-token') || '', config.secret, session)) {
      return json({ message: 'Güvenlik doğrulaması başarısız. Sayfayı yenileyip tekrar deneyin.' }, 403);
    }
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ message: 'İstek geçersiz.' }, 415);
    // Stream and bound bytes, including chunked bodies; do not trust Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return json({ message: 'İstek geçersiz.' }, 400);
    const maxBytes = ['cart-save','cart-merge','checkout-quote','checkout'].includes(operation) ? 65536 : 16384;
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength; if (size > maxBytes) { await reader.cancel(); return json({ message: 'İstek çok büyük.' }, 413); }
      chunks.push(value);
    }
    let data: unknown;
    try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return json({ message: 'İstek geçersiz.' }, 400); }
    let guest = '';
    if (operation === 'checkout' || operation === 'payment-result') {
      if (!data || typeof data !== 'object' || Array.isArray(data) || 'guestKey' in data) return json({ message: 'İstek geçersiz.' }, 400);
      guest = request.cookies.get(guestCookie())?.value || '';
      if (!guest) return json({ message: 'Çerezleri etkinleştirip tekrar deneyin.' }, 400);
      data = { ...data, guestKey: guest };
    }
    const result = await accountBackend(operation, data, session, clientKey(request));
    const { sessionToken, ...body } = result.body;
    const response = json(body, result.status);
    if (guest) response.cookies.set(guestCookie(), guest, { ...cookieOptions, maxAge: 604800 });
    if (result.status === 200 && operation === 'login' && sessionToken) {
      response.cookies.set(sessionCookie(), sessionToken, { ...cookieOptions, maxAge: 604800 });
      response.cookies.set(csrfCookie(), '', { ...cookieOptions, maxAge: 0 });
    }
    if ((result.status === 200 && operation === 'logout') || result.status === 401 && operation !== 'login') {
      response.cookies.set(sessionCookie(), '', { ...cookieOptions, maxAge: 0 });
      response.cookies.set(csrfCookie(), '', { ...cookieOptions, maxAge: 0 });
      response.cookies.set(guestCookie(), '', { ...cookieOptions, maxAge: 0 });
    }
    return response;
  } catch { return json({ message: 'Hesap hizmetine şu anda erişilemiyor. Lütfen tekrar deneyin.' }, 503); }
}
