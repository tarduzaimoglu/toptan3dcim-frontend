import Link from 'next/link';
import { accountBackend } from '@/lib/server/account';
import { EmptyState, PageHeading, StatusBadge, primaryButtonClass } from '@/components/account/ui';

type RequestListItem = { requestId: string; requestNumber: string; status: string; createdAt: string; package: { title: string } | null };

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false }, title: 'Figür Taleplerim' };

export default async function FigurineRequestsPage() {
  const result = await accountBackend('figurine-requests');
  const requests: RequestListItem[] = result.status === 200 ? result.body.requests || [] : [];
  return <><PageHeading eyebrow="Kişiye özel" title="Figür taleplerim" description="Talebinizin durumunu, teklifini ve sizden beklenen sonraki adımı görüntüleyin." action={<Link className={primaryButtonClass} href="/kisiye-ozel-figur">Yeni talep</Link>} />
    {result.status !== 200 ? <div role="alert" className="account-notice account-notice-error">Talepler şu anda yüklenemedi. Lütfen daha sonra tekrar deneyin.</div> : requests.length === 0 ? <EmptyState title="Henüz figür talebiniz yok" description="Paketinizi ve referans fotoğraflarınızı seçerek yeni bir talep oluşturabilirsiniz." href="/kisiye-ozel-figur" action="Talep oluştur" /> : <div className="account-surface overflow-hidden"><ul className="divide-y divide-slate-200">{requests.map(item => <li key={item.requestId}><Link href={`/hesap/figur-talepleri/${item.requestId}`} className="grid gap-3 p-5 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><strong className="text-slate-950">{item.requestNumber}</strong><StatusBadge tone="purple">{item.status}</StatusBadge></div><p className="mt-2 font-medium text-slate-700">{item.package?.title || 'Özel talep'}</p><p className="mt-1 text-sm text-slate-500">{new Date(item.createdAt).toLocaleString('tr-TR')}</p></div><span className="text-sm font-bold text-[#6D28D9]">Talebi görüntüle →</span></Link></li>)}</ul></div>}
  </>;
}
