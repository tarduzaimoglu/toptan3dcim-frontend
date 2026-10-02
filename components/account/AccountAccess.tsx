"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
export default function AccountAccess() {
  const [state, setState] = useState<'hidden' | 'guest' | 'member'>('hidden');
  useEffect(() => {
    let active = true;
    const update = async () => {
      try {
        const result = await fetch('/api/account/me', { cache: 'no-store' });
        if (active) setState(result.ok ? 'member' : result.status === 401 ? 'guest' : 'hidden');
      } catch { if (active) setState('hidden'); }
    };
    void update(); window.addEventListener('customer-session-changed', update);
    return () => { active = false; window.removeEventListener('customer-session-changed', update); };
  }, []);
  if (state === 'hidden') return null;
  return <Link href={state === 'member' ? '/hesap' : '/hesap/giris'} className="inline-flex min-h-11 items-center rounded-xl border border-purple-200 px-3 text-xs font-bold text-[#7C3AED] sm:text-sm">{state === 'member' ? 'Hesabım' : 'Giriş yap'}</Link>;
}
