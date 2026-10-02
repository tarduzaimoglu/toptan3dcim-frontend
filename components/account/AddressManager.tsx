"use client";
import { useState } from 'react';
import { accountRequest } from '@/lib/account-client';
type Address = { documentId?: string; label: string; fullName: string; phone: string; city: string; district: string; addressLine: string; postalCode: string; defaultShipping: boolean; defaultBilling: boolean };
const empty: Address = { label: '', fullName: '', phone: '', city: '', district: '', addressLine: '', postalCode: '', defaultShipping: false, defaultBilling: false };
export default function AddressManager({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState(initial); const [form, setForm] = useState<Address>({ ...empty });
  const [editing, setEditing] = useState<string | null>(null); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [message, setMessage] = useState('');
  async function mutate(operation: string, data: unknown) {
    setBusy(true); setError(''); setMessage('');
    try { const result = await accountRequest(operation, data); const list = await accountRequest('addresses'); setAddresses(list.addresses); setMessage(result.message); setEditing(null); setForm({ ...empty }); }
    catch (e) { setError(e instanceof Error ? e.message : 'İşlem tamamlanamadı.'); }
    finally { setBusy(false); }
  }
  const input = 'mt-2 w-full rounded-xl border border-slate-300 p-3 text-base focus:ring-2 focus:ring-purple-100';
  return <section><h2 className="text-xl font-bold">Adreslerim</h2><p className="mt-2 text-sm text-slate-600">Teslimat ve fatura için farklı varsayılan adresler seçebilirsiniz. Buradaki değişiklikler geçmiş siparişlerinizi değiştirmez.</p>
    {!addresses.length && <p className="my-5 rounded-xl bg-slate-50 p-5 text-slate-600">Henüz kayıtlı adresiniz yok. İlk adresinizi aşağıdan ekleyebilirsiniz.</p>}
    <div className="my-5 grid gap-4 sm:grid-cols-2">{addresses.map(a => <article key={a.documentId} className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">{a.label}</h3><p className="mt-2">{a.fullName}</p><p className="break-words text-sm text-slate-600">{a.addressLine}, {a.district} / {a.city}{a.postalCode ? `, ${a.postalCode}` : ''}</p>{a.phone && <p className="mt-1 text-sm">{a.phone}</p>}<div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-purple-800">{a.defaultShipping && <span className="rounded-lg bg-purple-50 p-2">Varsayılan teslimat</span>}{a.defaultBilling && <span className="rounded-lg bg-purple-50 p-2">Varsayılan fatura</span>}</div>
      <div className="mt-3 flex gap-3"><button type="button" disabled={busy} className="min-h-11 rounded-xl border px-4 text-sm font-semibold" onClick={() => { const { documentId, ...fields } = a; setEditing(documentId!); setForm(fields); setError(''); setMessage(''); }}>Düzenle</button><button type="button" disabled={busy} className="min-h-11 rounded-xl border px-4 text-sm font-semibold text-red-700" onClick={() => { if (window.confirm('Bu adresi silmek istediğinize emin misiniz?')) void mutate('address-delete', { id: a.documentId }); }}>Sil</button></div>
    </article>)}</div>
    <form onSubmit={e => { e.preventDefault(); void mutate('address-save', { ...(editing ? { id: editing } : {}), address: form }); }} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h3 className="text-lg font-bold">{editing ? 'Adresi düzenle' : 'Yeni adres ekle'}</h3>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{([['label', 'Adres adı', 'off'], ['fullName', 'Ad soyad', 'name'], ['phone', 'Telefon (isteğe bağlı)', 'tel'], ['city', 'İl', 'address-level1'], ['district', 'İlçe', 'address-level2'], ['postalCode', 'Posta kodu (isteğe bağlı)', 'postal-code']] as const).map(([key, label, autocomplete]) => <label key={key} className="block font-medium">{label}<input className={input} type={key === 'phone' ? 'tel' : 'text'} autoComplete={autocomplete} required={!['phone', 'postalCode'].includes(key)} maxLength={key === 'phone' ? 30 : key === 'postalCode' ? 20 : 100} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}</div>
      <label htmlFor="customer-address-line" className="mt-5 block font-medium">Açık adres</label><textarea id="customer-address-line" className={input} required autoComplete="street-address" maxLength={600} rows={3} value={form.addressLine} onChange={e => setForm({ ...form, addressLine: e.target.value })} />
      <div className="my-5 space-y-3">{([['defaultShipping', 'Varsayılan teslimat adresim'], ['defaultBilling', 'Varsayılan fatura adresim']] as const).map(([key, label]) => <label key={key} className="flex min-h-11 items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-[#7C3AED]" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />{label}</label>)}</div>
      <div className="flex flex-wrap gap-3"><button disabled={busy} className="min-h-12 rounded-xl bg-[#7C3AED] px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Kaydediliyor…' : 'Adresi kaydet'}</button>{editing && <button type="button" disabled={busy} className="min-h-12 rounded-xl border px-5" onClick={() => { setEditing(null); setForm({ ...empty }); }}>Vazgeç</button>}</div>
    </form>{error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-800">{error}</p>}{message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-800">{message}</p>}
  </section>;
}
