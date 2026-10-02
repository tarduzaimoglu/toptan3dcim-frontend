import Link from 'next/link';
import { currentCustomer } from '@/lib/server/account';
export default async function AccountPage() {
  const customer = await currentCustomer();
  return <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Merhaba{customer?.fullName ? `, ${customer.fullName}` : ''}</h2><p className="mt-2 break-words text-slate-600">{customer?.email}</p><p className="mt-4 text-slate-600">Profilinizi ve adreslerinizi düzenleyebilir, hesabınıza bağlı siparişlerinizi görüntüleyebilirsiniz.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{[['profil', 'Profilimi düzenle'], ['adresler', 'Adreslerimi yönet'], ['siparisler', 'Siparişlerimi görüntüle']].map(([route, label]) => <Link key={route} className="rounded-xl border border-purple-200 p-4 font-semibold text-[#7C3AED]" href={`/hesap/${route}`}>{label}</Link>)}</div></section>;
}
