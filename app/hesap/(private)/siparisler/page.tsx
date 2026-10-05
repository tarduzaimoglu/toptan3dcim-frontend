import Link from 'next/link';
import { accountBackend } from '@/lib/server/account';
import { date, money, orderStatuses, fulfillmentStatuses } from '@/lib/order-display';
import { EmptyState, PageHeading, StatusBadge } from '@/components/account/ui';
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  let result;
  try { result = await accountBackend('orders', { page: page || 1 }); }
  catch { result = null; }
  if (!result) return <p role="alert">Siparişler yüklenemedi. Lütfen tekrar deneyin.</p>;
    if (result.status !== 200) return <p role="alert">{result.body.message}</p>;
    const data = result.body;
    return <section><PageHeading eyebrow="Sipariş geçmişi" title="Siparişlerim" description="Ödeme ve operasyon durumunu ayrı ayrı takip edin." />{!data.orders.length ? <EmptyState title="Henüz siparişiniz yok" description="Hesabınıza bağlı bir sipariş bulunduğunda burada görüntülenecek." /> : <div className="account-surface overflow-hidden divide-y divide-slate-200">{data.orders.map((o: { documentId: string; orderNumber: string; createdAt: string; status: string; paymentState?: string; fulfillmentState?: string; grandTotal: number; currency: string }) => <Link key={o.documentId} href={`/hesap/siparisler/${o.documentId}`} className="grid gap-4 p-5 transition hover:bg-slate-50 md:grid-cols-[1fr_1fr_auto] md:items-center"><div><p className="break-all font-bold text-slate-950">{o.orderNumber}</p><p className="mt-1 text-sm text-slate-500">{date(o.createdAt)}</p></div><div className="flex flex-wrap gap-2"><StatusBadge tone="amber">Ödeme: {orderStatuses[o.paymentState || o.status] || 'Bilgi yok'}</StatusBadge><StatusBadge tone="purple">Operasyon: {fulfillmentStatuses[o.fulfillmentState || ''] || 'Bilgi yok'}</StatusBadge></div><div className="md:text-right"><p className="font-extrabold text-slate-950">{money(o.grandTotal, o.currency)}</p><span className="mt-1 block text-sm font-bold text-[#6D28D9]">Detay →</span></div></Link>)}</div>}<nav aria-label="Sipariş sayfaları" className="mt-5 flex gap-4 text-[#7C3AED]">{data.page > 1 && <Link className="account-button account-button-secondary" href={`?page=${data.page - 1}`}>Önceki</Link>}{data.page * 20 < data.total && <Link className="account-button account-button-secondary" href={`?page=${data.page + 1}`}>Sonraki</Link>}</nav></section>;
}
