'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { catalogReturn } from '@/lib/products/navigation';

export default function CatalogLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const returnTo = pathname === '/products' ? catalogReturn(`/products?${search}`) : null;
  return <Link href={returnTo ? `${href}?from=${encodeURIComponent(returnTo)}` : href} className={className}
    onClick={() => { if (returnTo) { try { sessionStorage.setItem(`catalog-scroll:${returnTo}`, String(window.scrollY)); } catch {} } }}>{children}</Link>;
}
