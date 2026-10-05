import Link from 'next/link';
import { currentCustomer } from '@/lib/server/account';
import { PageHeading } from '@/components/account/ui';
export default async function AccountPage() {
  const customer = await currentCustomer();
  return <><PageHeading eyebrow="Genel bakış" title={`Merhaba${customer?.fullName ? `, ${customer.fullName}` : ''}`} description="Hesap bilgileriniz, siparişleriniz ve kişiye özel figür talepleriniz burada." /><section className="account-surface"><div className="account-section"><p className="text-sm font-semibold text-slate-500">Hesap e-postası</p><p className="mt-1 break-words font-medium text-slate-900">{customer?.email}</p></div><div className="grid sm:grid-cols-3">{[['profil', 'Profil', 'Ad ve telefon bilgilerinizi güncelleyin.'], ['adresler', 'Adresler', 'Teslimat ve fatura adreslerinizi yönetin.'], ['siparisler', 'Siparişler', 'Sipariş durumu ve ayrıntılarını inceleyin.']].map(([route, label, text]) => <Link key={route} className="border-t border-slate-200 p-5 transition hover:bg-slate-50 sm:border-l sm:border-t-0 first:sm:border-l-0" href={`/hesap/${route}`}><strong className="text-slate-900">{label}</strong><span className="mt-1 block text-sm leading-6 text-slate-600">{text}</span><span className="mt-3 block text-sm font-bold text-[#6D28D9]">Aç →</span></Link>)}</div></section></>;
}
