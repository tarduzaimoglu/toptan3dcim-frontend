import 'server-only';
import { cookies, headers } from 'next/headers';
import { hash } from './account-security';

export const sessionCookie = () => process.env.NODE_ENV === 'production' ? '__Host-customer-session' : 'customer-session';
export const csrfCookie = () => process.env.NODE_ENV === 'production' ? '__Host-customer-csrf' : 'customer-csrf';
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
export class AccountServiceError extends Error {
  constructor(readonly code: string) { super(code); }
}
export function accountConfig() {
  const backend = process.env.CUSTOMER_STRAPI_INTERNAL_URL;
  const secret = process.env.CUSTOMER_BFF_SECRET;
  const origin = process.env.CUSTOMER_PUBLIC_ORIGIN;
  if (process.env.CUSTOMER_ACCOUNTS_ENABLED !== 'true') throw new AccountServiceError('ACCOUNT_FEATURE_DISABLED');
  if (!backend) throw new AccountServiceError('ACCOUNT_BACKEND_URL_MISSING');
  if (!secret || Buffer.byteLength(secret) < 32) throw new AccountServiceError('ACCOUNT_BFF_SECRET_MISSING_OR_INVALID');
  if (!origin) throw new AccountServiceError('ACCOUNT_PUBLIC_ORIGIN_MISSING');
  let site: URL;
  try { site = new URL(origin); } catch { throw new AccountServiceError('ACCOUNT_PUBLIC_ORIGIN_INVALID'); }
  if (site.origin !== origin || (process.env.NODE_ENV === 'production' && site.protocol !== 'https:')) throw new AccountServiceError('ACCOUNT_PUBLIC_ORIGIN_INVALID');
  return { backend, secret, origin };
}
export async function accountBackend(operation: string, data: unknown = {}, session?: string, client?: string) {
  const config = accountConfig();
  const token = session ?? (await cookies()).get(sessionCookie())?.value ?? '';
  const trustedHeader = process.env.CUSTOMER_TRUSTED_CLIENT_IP_HEADER;
  const source = client ?? (trustedHeader ? (await headers()).get(trustedHeader)?.trim() || 'unknown' : 'untrusted-proxy');
  const response = await fetch(`${config.backend.replace(/\/$/, '')}/api/customer/dispatch`, {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(operation === 'checkout' ? 75000 : 20000),
    headers: { 'Content-Type': 'application/json', 'x-customer-bff-key': config.secret, 'x-customer-session': token, 'x-customer-client': hash(source) },
    body: JSON.stringify({ operation, data }),
  });
  return { status: response.status, body: await response.json() };
}
export async function currentCustomer() {
  try {
    const response = await accountBackend('me');
    return response.status === 200 ? response.body.user : null;
  } catch { return null; }
}
