'use client';
import Link from 'next/link';
export default function Error({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-3xl px-5 py-24 text-center"><h1 className="text-2xl font-bold">Ürün bilgileri yüklenemedi</h1><button onClick={reset} className="m-5 rounded-xl bg-[#FF5733] px-5 py-3 text-white">Tekrar dene</button><Link href="/products" className="block text-[#7C3AED]">Ürünlere dön</Link></main>;
}
