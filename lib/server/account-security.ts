import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export function constantEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length > 0 && x.length === y.length && timingSafeEqual(x, y);
}
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export function csrfTicket(secret: string, session = '', now = Date.now()) {
  const value = `${randomBytes(24).toString('base64url')}.${now}.${hash(session)}`;
  return `${value}.${createHmac('sha256', secret).update(value).digest('base64url')}`;
}
export function validCsrf(ticket: string, header: string, secret: string, session = '', now = Date.now()) {
  if (!constantEqual(ticket || '', header || '')) return false;
  const [nonce, timestamp, binding, mac, ...extra] = ticket.split('.');
  const age = now - Number(timestamp);
  if (extra.length || !nonce || !mac || !Number.isFinite(age) || age < 0 || age > 3600000 || binding !== hash(session)) return false;
  return constantEqual(mac, createHmac('sha256', secret).update(`${nonce}.${timestamp}.${binding}`).digest('base64url'));
}
export function validOrigin(origin: string | null, site: string, fetchSite: string | null) {
  return origin === site && (!fetchSite || fetchSite === 'same-origin' || fetchSite === 'none');
}
export { safeReturn } from '../account-redirect';
