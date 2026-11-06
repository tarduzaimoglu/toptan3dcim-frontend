import Link from 'next/link';
export default function NotFound() {
  return <main className="mx-auto max-w-3xl px-5 py-24 text-center"><h1 className="text-3xl font-bold">Ürün bulunamadı</h1><p className="my-5 text-slate-500">Bu ürün yayında değil veya adresi mevcut değil.</p><Link href="/products" className="font-semibold text-[#7C3AED]">Ürünlere dön →</Link></main>;
}
