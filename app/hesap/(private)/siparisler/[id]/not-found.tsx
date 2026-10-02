import Link from 'next/link';
export default function Page() { return <div><h2 className="text-xl font-bold">Sipariş bulunamadı</h2><p className="mt-3 text-slate-600">Bu sipariş mevcut değil veya hesabınıza bağlı değil.</p><Link className="mt-4 inline-block py-3 text-[#7C3AED]" href="/hesap/siparisler">Siparişlerime dön</Link></div>; }
