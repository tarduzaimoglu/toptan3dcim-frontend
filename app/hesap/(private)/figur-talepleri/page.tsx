import Link from 'next/link';
import { accountBackend } from '@/lib/server/account';

type RequestListItem = { requestId: string; requestNumber: string; status: string; createdAt: string; package: { title: string } | null };

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false }, title: 'Figür Taleplerim' };

export default async function FigurineRequestsPage() {
  const result = await accountBackend('figurine-requests');
  const requests: RequestListItem[] = result.status === 200 ? result.body.requests || [] : [];
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
    <h2 className="text-2xl font-bold">Figür taleplerim</h2>
    {result.status !== 200 ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-red-800">Talepler şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.</p> : requests.length === 0 ? <div className="mt-5 rounded-xl bg-slate-50 p-5"><p>Henüz bir kişiye özel figür talebiniz yok.</p><Link className="mt-4 inline-block rounded-xl bg-[#7C3AED] px-5 py-3 font-bold text-white" href="/kisiye-ozel-figur">Talep oluştur</Link></div> : <ul className="mt-5 divide-y divide-slate-200">{requests.map(item => <li key={item.requestId} className="py-4"><Link href={`/hesap/figur-talepleri/${item.requestId}`} className="flex flex-wrap justify-between gap-2 font-semibold text-[#6D28D9]"><span>{item.requestNumber} · {item.package?.title || 'Özel talep'}</span><span>{item.status}</span></Link><p className="mt-1 text-sm text-slate-500">{new Date(item.createdAt).toLocaleString('tr-TR')}</p></li>)}</ul>}
  </section>;
}
