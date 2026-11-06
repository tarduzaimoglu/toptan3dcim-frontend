import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { getProductBySlug, getRelatedProductPage, getCatalogCategories, getCatalogColorOptions } from '@/lib/strapi';
import { productPath } from '@/lib/products/navigation';
import ProductDetail from '@/components/products/ProductDetail';
import BackToCatalog from '@/components/products/BackToCatalog';
import ProductPageCatalog from '@/components/products/ProductPageCatalog';
import { SHOW_PRICES } from '@/lib/config';

export const revalidate = 10;
const ORIGIN = 'https://toptan3dcim.com';
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

async function resolve(slug: string) {
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  if (product.slug !== slug) permanentRedirect(productPath(product));
  return product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await resolve((await params).slug);
  const description = (product.description?.join(' ') || product.bullets.join(' ') || product.title).slice(0, 160);
  const url = `${ORIGIN}${productPath(product)}`;
  const images = product.imageUrl ? [new URL(product.imageUrl, ORIGIN).href] : [];
  return { title: `${product.title} | Toptan3Dcim`, description, alternates: { canonical: url },
    openGraph: { title: product.title, description, url, images }, twitter: { card: 'summary_large_image', title: product.title, description, images } };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const product = await resolve((await params).slug);
  const query = new URLSearchParams();
  const filters = await searchParams;
  for (const key of ['cats', 'colors', 'sort', 'q']) if (typeof filters[key] === 'string') query.set(key, filters[key]);
  const [related, categories, colorOptions] = await Promise.all([
    getRelatedProductPage(product, query), getCatalogCategories(), getCatalogColorOptions(),
  ]);
  const url = `${ORIGIN}${productPath(product)}`;
  const categoryUrl = `/products?cats=${encodeURIComponent(product.category)}`;
  const breadcrumbs = [{ name: 'Ana sayfa', item: ORIGIN }, { name: 'Ürünler', item: `${ORIGIN}/products` },
    ...(product.categoryTitle ? [{ name: product.categoryTitle, item: `${ORIGIN}${categoryUrl}` }] : []), { name: product.title, item: url }];
  const json = [{ '@context': 'https://schema.org', '@type': 'Product', name: product.title, url,
    ...(product.description.length ? { description: product.description.join(' ') } : {}),
    ...(product.imageUrls.length ? { image: product.imageUrls.map((s: string) => new URL(s, ORIGIN).href) } : {}),
    ...(product.categoryTitle ? { category: product.categoryTitle } : {}),
    ...(SHOW_PRICES && typeof product.wholesalePrice === 'number' && product.wholesalePrice >= 0 ? { offers: { '@type': 'Offer', url, price: product.wholesalePrice, priceCurrency: 'TRY' } } : {}) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbs.map((b, i) => ({ '@type': 'ListItem', position: i + 1, ...b })) }];
  return <main className="mx-auto min-h-screen max-w-7xl px-4 pb-16 pt-4 md:px-6">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json).replace(/</g, '\\u003c') }} />
    <Suspense><ProductPageCatalog slug={product.slug} category={product.category} categories={categories} colors={colorOptions.colors} initial={related}>
    <Suspense fallback={<Link href="/products">← Ürünlere dön</Link>}><BackToCatalog /></Suspense>
    <nav aria-label="Kategori yolu" className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500"><Link href="/">Ana sayfa</Link><span>/</span><Link href="/products">Ürünler</Link>{product.categoryTitle && <><span>/</span><Link href={categoryUrl}>{product.categoryTitle}</Link></>}<span>/</span><span aria-current="page">{product.title}</span></nav>
    <h1 className="mb-8 mt-5 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">{product.title}</h1>
    <ProductDetail key={product.id} product={product} />
    </ProductPageCatalog></Suspense>
  </main>;
}
