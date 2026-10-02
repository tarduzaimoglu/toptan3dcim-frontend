"use client";
import { useState } from 'react';
import { accountRequest } from '@/lib/account-client';
const inputClass = 'mt-2 w-full rounded-xl border border-slate-300 p-3 text-base focus:ring-2 focus:ring-purple-100';
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
  return <div className="grid gap-6 md:grid-cols-2">
    <form onSubmit={save} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">Profil bilgilerim</h2>
      <label className="block font-medium">Ad soyad<input className={inputClass} autoComplete="name" required maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="block font-medium">Telefon (isteğe bağlı)<input className={inputClass} type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} /></label>
      <button disabled={busy} className="min-h-12 w-full rounded-xl bg-[#7C3AED] p-3 font-semibold text-white disabled:opacity-50">{busy ? 'İşlem yapılıyor…' : 'Profili kaydet'}</button>
    </form>
    <form onSubmit={e => save(e, true)} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-xl font-bold">E-posta değişikliği</h2><p className="break-words text-sm text-slate-600">Mevcut adres: {initial.email}. Yeni adres doğrulanana kadar bu adres kullanılacak. Doğrulama sonrası yeniden giriş yapmanız gerekir.</p>
      <label className="block font-medium">Yeni e-posta<input className={inputClass} type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="block font-medium">Mevcut şifre<input className={inputClass} type="password" autoComplete="current-password" required maxLength={72} value={pass} onChange={e => setPass(e.target.value)} /></label>
      <button disabled={busy} className="min-h-12 w-full rounded-xl border border-purple-300 p-3 font-semibold text-[#7C3AED] disabled:opacity-50">Doğrulama e-postası gönder</button>
    </form>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800 md:col-span-2">{error}</p>}{message && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800 md:col-span-2">{message}</p>}
  </div>;
}
