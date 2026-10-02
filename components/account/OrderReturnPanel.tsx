'use client';

import { useEffect, useState } from 'react';
import { accountRequest } from '@/lib/account-client';

type ReturnRequest = { id: string; orderId: string; orderNumber: string; reason: string; state: string; customerNote: string; createdAt: string; decisionAt: string | null };
const labels: Record<string, string> = { submitted: 'Alındı', reviewing: 'İnceleniyor', accepted: 'Başvuru kabul edildi', rejected: 'Başvuru reddedildi' };
export default function OrderReturnPanel({ orderId }: { orderId: string }) {
  const [rows, setRows] = useState<ReturnRequest[]>([]), [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  async function load() { try { const result = await accountRequest('figurine-return-list'); setRows((result.returnRequests || []).filter((r: ReturnRequest) => r.orderId === orderId)); } catch (e) { setError(e instanceof Error ? e.message : 'Başvurular yüklenemedi.'); } }
  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps -- load is scoped to orderId.
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (busy || !reason.trim()) return; setBusy(true); setError(''); setMessage('');
    try {
      await accountRequest('figurine-return-submit', { orderId, reason, idempotencyKey: crypto.randomUUID().replaceAll('-', '') });
      setReason(''); setMessage('Başvurunuz kaydedildi. Bu işlem siparişi iptal etmez veya ödeme iadesi başlatmaz.'); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Başvuru gönderilemedi.'); }
    finally { setBusy(false); }
  }
  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">İptal / iade başvurusu</h3>
    <p className="text-sm text-slate-600">Başvuru operasyon ekibi tarafından incelenir; siparişi otomatik iptal etmez ve para iadesi gerçekleştirmez.</p>
    {rows.map(row => <article key={row.id} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="font-semibold">{labels[row.state] || row.state} · {new Date(row.createdAt).toLocaleString('tr-TR')}</p><p className="mt-1 whitespace-pre-wrap">{row.reason}</p>{row.customerNote && <p className="mt-2 whitespace-pre-wrap">Yanıt: {row.customerNote}</p>}</article>)}
    {rows.length === 0 && <form onSubmit={submit} className="space-y-3"><label className="block text-sm font-medium">Başvuru açıklaması<textarea required minLength={5} maxLength={3000} rows={4} value={reason} onChange={e => setReason(e.target.value)} className="mt-1 w-full rounded-xl border p-3" /></label><button disabled={busy} className="min-h-11 rounded-xl bg-violet-700 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? 'Gönderiliyor…' : 'Başvuru gönder'}</button></form>}
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}{message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
  </section>;
}
