"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { accountRequest } from '@/lib/account-client';
import { safeReturn } from '@/lib/account-redirect';

type Mode = 'login' | 'register' | 'forgot' | 'resend' | 'verify' | 'reset';
const titles: Record<Mode, string> = { login: 'Hesabınıza giriş yapın', register: 'Hesap oluşturun', forgot: 'Şifremi unuttum', resend: 'Yeni doğrulama e-postası', verify: 'E-posta doğrulama', reset: 'Yeni şifre belirleyin' };
const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-base outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100';
export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [token, setToken] = useState(''); const [email, setEmail] = useState('');
  const [pass, setPass] = useState(''); const [confirmation, setConfirmation] = useState(''); const [name, setName] = useState('');
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const [serviceState, setServiceState] = useState<'checking'|'available'|'unavailable'>('checking');
  const [serviceMessage, setServiceMessage] = useState('');
  useEffect(() => {
    let active = true;
    fetch('/api/account/me', { cache: 'no-store' }).then(async response => {
      if (!active) return;
      if (response.status === 200 || response.status === 401) { setServiceState('available'); return; }
      let body: { code?: string } = {};
      try { body = await response.json(); } catch { /* use generic safe message */ }
      if (!active) return;
      const messages: Record<string, string> = {
        ACCOUNT_BFF_FEATURE_DISABLED: 'Hesap hizmeti şu anda kullanıma açılmamış.',
        ACCOUNT_FEATURE_DISABLED: 'Hesap hizmeti şu anda bakım nedeniyle kapalı.',
        ACCOUNT_BACKEND_URL_MISSING: 'Hesap servisi bağlantısı yapılandırılmamış.',
        ACCOUNT_BFF_SECRET_MISSING_OR_INVALID: 'Hesap servisi güvenli bağlantı ayarı eksik.',
        ACCOUNT_BACKEND_UNREACHABLE: 'Hesap sunucusuna şu anda ulaşılamıyor.',
      };
      setServiceMessage(messages[body.code || ''] || 'Hesap hizmetine şu anda erişilemiyor. Lütfen daha sonra tekrar deneyin.');
      setServiceState('unavailable');
    }).catch(() => {
      if (active) { setServiceMessage('Hesap sunucusuna şu anda ulaşılamıyor.'); setServiceState('unavailable'); }
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (mode === 'verify' || mode === 'reset') {
      const value = new URLSearchParams(window.location.hash.slice(1)).get('token') || '';
      window.history.replaceState(null, '', window.location.pathname);
      const timer = window.setTimeout(() => setToken(value), 0);
      return () => window.clearTimeout(timer);
    }
  }, [mode]);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(''); setMessage('');
    if ((mode === 'register' || mode === 'reset') && pass !== confirmation) { setError('Şifreler eşleşmiyor.'); return; }
    setBusy(true);
    try {
      const data = mode === 'verify' ? { token } : mode === 'reset' ? { token, password: pass } : mode === 'register' ? { email, password: pass, fullName: name } : mode === 'login' ? { email, password: pass } : { email };
      const result = await accountRequest(mode, data);
      setPass(''); setConfirmation(''); setMessage(result.message || 'İşlem tamamlandı.');
      if (mode === 'login') {
        window.dispatchEvent(new Event('customer-session-changed'));
        const target = safeReturn(new URLSearchParams(window.location.search).get('returnTo'));
        router.replace(target); router.refresh();
      }
      if (mode === 'verify' || mode === 'reset') setToken('');
    } catch (e) { setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı.'); }
    finally { setBusy(false); }
  }
  const linkMode = mode === 'verify' || mode === 'reset';
  return <div className="mx-auto max-w-lg px-4 py-12 text-slate-900">
    <h1 className="text-3xl font-bold">{titles[mode]}</h1>
    {serviceState === 'checking' && <p role="status" className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">Hesap hizmeti kontrol ediliyor…</p>}
    {serviceState === 'unavailable' && <section role="alert" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><p className="font-semibold">{serviceMessage}</p><p className="mt-2">Giriş, kayıt ve e-posta işlemleri şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.</p></section>}
    {serviceState === 'available' && <>
    {mode === 'register' && <p className="mt-3 text-slate-600">Üyelik için adres bilgisi gerekmez. E-posta adresinizi doğruladıktan sonra hesabınıza giriş yapabilirsiniz.</p>}
    {mode === 'verify' && <p className="mt-3 text-slate-600">E-posta adresinizi doğrulamak için aşağıdaki düğmeye basın.</p>}
    <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      {mode === 'register' && <label className="block font-medium">Ad soyad<input className={inputClass} autoComplete="name" required maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label>}
      {!linkMode && <label className="block font-medium">E-posta<input className={inputClass} type="email" autoComplete="email" inputMode="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label>}
      {['register', 'login', 'reset'].includes(mode) && <label className="block font-medium">{mode === 'reset' ? 'Yeni şifre' : 'Şifre'}<input className={inputClass} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'login' ? undefined : 12} maxLength={72} value={pass} onChange={e => setPass(e.target.value)} /></label>}
      {['register', 'reset'].includes(mode) && <><p className="text-sm text-slate-600">En az 12 karakter kullanın. Şifre en fazla 72 bayt olabilir.</p><label className="block font-medium">Şifre tekrar<input className={inputClass} type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label></>}
      {linkMode && !token && !message && <p role="alert" className="text-sm text-amber-800">Geçerli bir bağlantı bulunamadı. E-postanızdaki bağlantıyı açın veya yeni bağlantı isteyin.</p>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-emerald-800">{message}</p>}
      <button disabled={busy || linkMode && !token} className="min-h-12 w-full rounded-xl bg-[#7C3AED] px-4 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'İşlem yapılıyor…' : mode === 'login' ? 'Giriş yap' : mode === 'register' ? 'Hesap oluştur' : mode === 'verify' ? 'E-postayı doğrula' : mode === 'reset' ? 'Şifreyi güncelle' : 'E-posta gönder'}</button>
    </form>
    <nav aria-label="Üyelik işlemleri" className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#7C3AED]">
      <Link href="/hesap/giris">Giriş yap</Link><Link href="/hesap/kayit">Hesap oluştur</Link><Link href="/hesap/sifremi-unuttum">Şifremi unuttum</Link><Link href="/hesap/dogrulama-gonder">Doğrulama e-postası iste</Link>
    </nav>
    </>}
  </div>;
}
