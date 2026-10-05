"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { accountRequest } from '@/lib/account-client';
import { safeReturn } from '@/lib/account-redirect';
import { Notice, fieldClass, primaryButtonClass } from '@/components/account/ui';

type Mode = 'login' | 'register' | 'forgot' | 'resend' | 'verify' | 'reset';
const titles: Record<Mode, string> = { login: 'Hesabınıza giriş yapın', register: 'Hesap oluşturun', forgot: 'Şifremi unuttum', resend: 'Yeni doğrulama e-postası', verify: 'E-posta doğrulama', reset: 'Yeni şifre belirleyin' };
const inputClass = fieldClass;
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
  return <main className="account-workspace px-4 py-10 sm:py-16"><div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_48px_rgba(15,23,42,.07)] md:grid-cols-[minmax(0,1fr)_23rem]">
    <section className="p-6 sm:p-9"><p className="account-eyebrow">Güvenli müşteri hesabı</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{titles[mode]}</h1>
    {serviceState === 'checking' && <div className="mt-5"><Notice>Hesap hizmeti kontrol ediliyor…</Notice></div>}
    {serviceState === 'unavailable' && <div className="mt-5"><Notice kind="warning" role="alert"><p className="font-semibold">{serviceMessage}</p><p className="mt-2">Giriş, kayıt ve e-posta işlemleri şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.</p></Notice></div>}
    {serviceState === 'available' && <>
    {mode === 'register' && <p className="mt-3 text-slate-600">Üyelik için adres bilgisi gerekmez. E-posta adresinizi doğruladıktan sonra hesabınıza giriş yapabilirsiniz.</p>}
    {mode === 'verify' && <p className="mt-3 text-slate-600">E-posta adresinizi doğrulamak için aşağıdaki düğmeye basın.</p>}
    <form onSubmit={submit} className="mt-7 space-y-5">
      {mode === 'register' && <label className="block font-medium">Ad soyad<input className={inputClass} autoComplete="name" required maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label>}
      {!linkMode && <label className="block font-medium">E-posta<input className={inputClass} type="email" autoComplete="email" inputMode="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label>}
      {['register', 'login', 'reset'].includes(mode) && <label className="block font-medium">{mode === 'reset' ? 'Yeni şifre' : 'Şifre'}<input className={inputClass} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'login' ? undefined : 12} maxLength={72} value={pass} onChange={e => setPass(e.target.value)} /></label>}
      {['register', 'reset'].includes(mode) && <><p className="text-sm text-slate-600">En az 12 karakter kullanın. Şifre en fazla 72 bayt olabilir.</p><label className="block font-medium">Şifre tekrar<input className={inputClass} type="password" autoComplete="new-password" required minLength={12} maxLength={72} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></label></>}
      {linkMode && !token && !message && <p role="alert" className="text-sm text-amber-800">Geçerli bir bağlantı bulunamadı. E-postanızdaki bağlantıyı açın veya yeni bağlantı isteyin.</p>}
      {error && <Notice kind="error">{error}</Notice>}
      {message && <Notice kind="success">{message}</Notice>}
      <button disabled={busy || linkMode && !token} className={`${primaryButtonClass} w-full`}>{busy ? 'İşlem yapılıyor…' : mode === 'login' ? 'Giriş yap' : mode === 'register' ? 'Hesap oluştur' : mode === 'verify' ? 'E-postayı doğrula' : mode === 'reset' ? 'Şifreyi güncelle' : 'E-posta gönder'}</button>
    </form>
    <nav aria-label="Üyelik işlemleri" className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#7C3AED]">
      <Link href="/hesap/giris">Giriş yap</Link><Link href="/hesap/kayit">Hesap oluştur</Link><Link href="/hesap/sifremi-unuttum">Şifremi unuttum</Link><Link href="/hesap/dogrulama-gonder">Doğrulama e-postası iste</Link>
    </nav>
    </>}
    </section><aside className="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 md:border-l md:border-t-0"><h2 className="text-lg font-bold text-slate-900">Hesabınızla neler yapabilirsiniz?</h2><ul className="mt-5 space-y-4 text-sm leading-6 text-slate-600"><li><strong className="block text-slate-800">Siparişlerinizi izleyin</strong>Ödeme ve operasyon durumlarını ayrı görüntüleyin.</li><li><strong className="block text-slate-800">Figür taleplerinizi yönetin</strong>Fotoğrafları, teklifleri ve sonraki adımı tek yerde görün.</li><li><strong className="block text-slate-800">Bilgilerinizi güncelleyin</strong>Profil, adres ve iletişim tercihlerinizi yönetin.</li></ul><p className="mt-8 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">Şifrenizi veya doğrulama bağlantınızı e-posta dışında paylaşmayın.</p></aside>
  </div></main>;
}
