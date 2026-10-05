"use client";
import { useState } from 'react';
import { accountRequest } from '@/lib/account-client';
import { Notice, PageHeading, fieldClass, primaryButtonClass, secondaryButtonClass } from '@/components/account/ui';
const inputClass = fieldClass;
export default function ProfileForm({ initial }: { initial: { fullName: string; phone: string; email: string } }) {
  const [name, setName] = useState(initial.fullName); const [phone, setPhone] = useState(initial.phone);
  const [email, setEmail] = useState(''); const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  async function save(e: React.FormEvent, changeEmail = false) {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const result = await accountRequest(changeEmail ? 'email-change' : 'profile', changeEmail ? { email, password: pass } : { fullName: name, phone }); setMessage(result.message); setPass(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı.'); }
    finally { setBusy(false); }
  }
  return <><PageHeading eyebrow="Hesap bilgileri" title="Profilim" description="İletişim bilgilerinizi güncel tutun. E-posta değişikliği ayrıca doğrulanır." /><div className="grid gap-5 md:grid-cols-2">
    <form onSubmit={save} className="account-surface space-y-5 p-5 sm:p-6"><h3 className="account-section-title">Profil bilgileri</h3>
      <label className="block font-medium">Ad soyad<input className={inputClass} autoComplete="name" required maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="block font-medium">Telefon (isteğe bağlı)<input className={inputClass} type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} /></label>
      <button disabled={busy} className={`${primaryButtonClass} w-full`}>{busy ? 'İşlem yapılıyor…' : 'Profili kaydet'}</button>
    </form>
    <form onSubmit={e => save(e, true)} className="account-surface space-y-5 p-5 sm:p-6"><h3 className="account-section-title">E-posta değişikliği</h3><p className="break-words text-sm leading-6 text-slate-600">Mevcut adres: {initial.email}. Yeni adres doğrulanana kadar bu adres kullanılacak. Doğrulama sonrası yeniden giriş yapmanız gerekir.</p>
      <label className="block font-medium">Yeni e-posta<input className={inputClass} type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="block font-medium">Mevcut şifre<input className={inputClass} type="password" autoComplete="current-password" required maxLength={72} value={pass} onChange={e => setPass(e.target.value)} /></label>
      <button disabled={busy} className={`${secondaryButtonClass} w-full`}>Doğrulama e-postası gönder</button>
    </form>
    {error && <div className="md:col-span-2"><Notice kind="error">{error}</Notice></div>}{message && <div className="md:col-span-2"><Notice kind="success">{message}</Notice></div>}
  </div></>;
}
