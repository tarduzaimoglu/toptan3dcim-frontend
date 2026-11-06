'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { catalogReturn } from '@/lib/products/navigation';

export default function BackToCatalog() {
  const search = useSearchParams();
  return <Link href={catalogReturn(search.get('from'))} className="inline-flex py-3 text-sm font-semibold text-[#7C3AED]">← Ürünlere dön</Link>;
}
