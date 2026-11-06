'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import ProductFilter from './ProductFilter';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/products/types';

type Page = { products: Product[]; hasMore: boolean; page: number };
type Props = {
  slug: string;
  category: string;
  categories: { key: string; label: string }[];
  colors: { id: string; label: string; hex: string }[];
  initial: Page;
  children: React.ReactNode;
};

function Recommendations({ slug, initial, query }: { slug: string; initial: Page; query: string }) {
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    if (pending.current || !data.hasMore) return;
    pending.current = true; setLoading(true); setError(false);
    const request = new AbortController();
    controller.current = request;
    try {
      const params = new URLSearchParams(query);
      params.set('slug', slug); params.set('page', String(data.page + 1));
      const response = await fetch(`/api/products/related?${params}`, { signal: request.signal });
      if (!response.ok) throw new Error('load');
      const next: Page = await response.json();
      setData(prev => ({ ...next, products: [...new Map([...prev.products, ...next.products].map(p => [p.documentId || p.id, p])).values()] }));
    } catch { if (!request.signal.aborted) setError(true); }
    finally { pending.current = false; if (!request.signal.aborted) setLoading(false); }
  }, [data.hasMore, data.page, query, slug]);

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!sentinel.current || !data.hasMore || error || loading) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) void load(); }, { rootMargin: '350px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [load, data.hasMore, error, loading]);

  return <section id="oneriler" aria-labelledby="recommendations-heading" className="mt-12 scroll-mt-28 border-t border-slate-100 pt-8">
    <h2 id="recommendations-heading" className="mb-6 text-2xl font-bold">İlginizi çekebilecek ürünler</h2>
    {data.products.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">{data.products.map(p => <ProductCard key={p.id} product={p} />)}</div> : <p className="py-8 text-sm text-slate-500">Bu filtrelere uygun başka ürün bulunamadı.</p>}
    <div ref={sentinel} className="flex min-h-24 items-center justify-center" aria-live="polite">
      {loading ? <p className="text-sm text-slate-500">Ürünler yükleniyor…</p> : data.hasMore ? <button onClick={() => void load()} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold hover:border-[#7C3AED]">{error ? 'Yüklenemedi, tekrar dene' : 'Daha fazla ürün göster'}</button> : null}
    </div>
  </section>;
}

export default function ProductPageCatalog({ slug, category, categories, colors, initial, children }: Props) {
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const cats = search.has('cats') ? (search.get('cats') || '').split(',').filter(Boolean) : category ? [category] : [];
  const selectedColors = (search.get('colors') || '').split(',').filter(Boolean);
  const query = new URLSearchParams();
  for (const key of ['cats', 'colors', 'sort', 'q']) if (search.has(key)) query.set(key, search.get(key)!);
  const queryKey = query.toString();
  function update(values: Record<string, string | null>) {
    const next = new URLSearchParams(search.toString());
    for (const [key, value] of Object.entries(values)) { if (value === null) next.delete(key); else next.set(key, value); }
    router.push(`${pathname}${next.size ? `?${next}` : ''}`, { scroll: false });
  }
  function toggle(values: string[], value: string) { return (values.includes(value) ? values.filter(v => v !== value) : [...values, value]).join(','); }
  return <div className="mt-4 flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
    <ProductFilter categories={categories} availableColors={colors} selectedCategories={cats} selectedColors={selectedColors}
      searchQuery={search.get('q') || ''} sortOption={search.get('sort') || 'newest'} allProducts={[]}
      onCategoryToggle={value => update({ cats: toggle(cats, value) })}
      onColorToggle={value => update({ colors: toggle(selectedColors, value) || null })}
      onSortChange={value => update({ sort: value })}
      onSearchChange={value => update({ q: value || null })} onSearchSubmit={value => update({ q: value || null })}
      onClearAll={() => update({ cats: '', colors: null, sort: null, q: null })} />
    <div className="min-w-0 w-full flex-1 pb-20 lg:w-3/4 lg:pb-0">
      {children}
      <Recommendations key={queryKey} slug={slug} initial={initial} query={queryKey} />
    </div>
  </div>;
}
