export function safeReturn(value: string | null | undefined) {
  if (value === '/kisiye-ozel-figur') return value;
  return value && /^\/hesap(?:\/(?:profil|adresler|siparisler)(?:\/[a-zA-Z0-9_-]+)?)?$/.test(value) ? value : '/hesap';
}
