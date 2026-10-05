"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { accountRequest } from '@/lib/account-client';
export default function LogoutButton() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  return <div><button disabled={busy} className="account-button account-button-secondary" onClick={async () => {
    setBusy(true); setError('');
    try { await accountRequest('logout', {}); window.dispatchEvent(new Event('customer-session-changed')); router.replace('/hesap/giris'); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Çıkış yapılamadı.'); setBusy(false); }
  }}>{busy ? 'Çıkış yapılıyor…' : 'Çıkış yap'}</button>{error && <p role="alert" className="mt-2 text-sm text-red-800">{error}</p>}</div>;
}
