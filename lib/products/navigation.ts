export function productPath(product: { slug?: string; id: string }) {
  return product.slug ? `/urunler/${encodeURIComponent(product.slug)}` : `/products?open=${encodeURIComponent(product.id)}`;
}

// Only the catalog can be a return destination. Never accept arbitrary URLs.
export function catalogReturn(value: unknown): string {
  if (typeof value !== 'string' || /[\\\r\n]/.test(value)) return '/products';
  try {
    const url = new URL(value, 'https://toptan3dcim.com');
    if (!value.startsWith('/products') || url.origin !== 'https://toptan3dcim.com' || url.pathname !== '/products') return '/products';
    const query = new URLSearchParams();
    for (const key of ['q', 'cats', 'colors', 'sort', 'page']) {
      const v = url.searchParams.get(key);
      if (v) query.set(key, v);
    }
    return `/products${query.size ? `?${query}` : ''}`;
  } catch { return '/products'; }
}
