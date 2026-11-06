type AnyObj = Record<string, any>;
import { STANDARD_COLORS, getClosestStandardColor } from '@/lib/products/colors';

export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";
const CACHE_REVALIDATE = 3600;

// ✅ YENİ: Sayfa geçişlerinin 0ms kalması ve Strapi verilerinin taze akması için ideal süre (10 saniye)
const FAST_REVALIDATE = 10; 

function unwrapEntity(entity: any) {
  if (entity && typeof entity === "object" && "attributes" in entity) {
    return { id: entity.id, ...entity.attributes };
  }
  return entity;
}

function unwrapCollection(res: any) {
  const arr = Array.isArray(res?.data) ? res.data : [];
  return arr.map(unwrapEntity).filter(Boolean) as AnyObj[];
}

function unwrapRelation(rel: any) {
  if (!rel) return null;
  if (rel && typeof rel === "object" && "data" in rel) return unwrapEntity(rel.data);
  return unwrapEntity(rel);
}

export function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();
  const add = (key: string, val: any) => {
    if (val === undefined || val === null || val === "") return;
    sp.set(key, String(val));
  };
  if (params.filters?.slug?.$eq) add("filters[slug][$eq]", params.filters.slug.$eq);
  if (params.filters?.category?.slug?.$eq) add("filters[category][slug][$eq]", params.filters.category.slug.$eq);
  if (Array.isArray(params.sort)) params.sort.forEach((s: string, i: number) => add(`sort[${i}]`, s));
  if (params.pagination?.pageSize) add("pagination[pageSize]", params.pagination.pageSize);
  
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export async function strapiFetch<T>(path: string, init?: RequestInit & { revalidate?: number }): Promise<T> {
  const url = `${STRAPI_URL}${path}`;
  const headers = new Headers(init?.headers);
  if (STRAPI_TOKEN) headers.set("Authorization", `Bearer ${STRAPI_TOKEN}`);

  const revalidateVal = init?.revalidate ?? CACHE_REVALIDATE;
  const { next, ...restInit } = init || {};

  const res = await fetch(url, {
    ...restInit,
    headers,
    ...(revalidateVal === 0 
      ? { cache: "no-store" } 
      : { next: { ...next, revalidate: revalidateVal } }
    ),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Strapi error ${res.status} on ${path}: ${txt}`);
  }
  return (await res.json()) as T;
}

function absMediaUrl(maybeRelativeUrl?: string | null) {
  if (!maybeRelativeUrl) return null;
  if (maybeRelativeUrl.startsWith("/uploads/")) return `/backend${maybeRelativeUrl}`;
  try {
    const url = new URL(maybeRelativeUrl);
    if (url.origin === "https://kesiolabs-slave1.tail4be241.ts.net" && url.pathname.startsWith("/uploads/")) {
      return `/backend${url.pathname}${url.search}${url.hash}`;
    }
  } catch {}
  return maybeRelativeUrl;
}

export function getMediaUrls(media: any): string[] {
  if (!media) return [];
  if (Array.isArray(media)) return media.map((x: any) => x?.url ?? x?.attributes?.url).map(absMediaUrl).filter((u: string | null): u is string => typeof u === "string");
  if (Array.isArray(media?.data)) return media.data.map((x: any) => x?.attributes?.url ?? x?.url).map(absMediaUrl).filter((u: string | null): u is string => typeof u === "string");
  const url = media?.data?.attributes?.url || media?.data?.url || media?.url;
  return url ? [absMediaUrl(url)!] : [];
}

export function getMediaUrl(media: any): string | null { return getMediaUrls(media)[0] ?? null; }

// ✅ Bant genişliği optimizasyonu: kart/liste görünümleri için Strapi'nin küçük format varyantını kullanır (small → thumbnail → orijinal fallback zinciri)
function pickThumbUrl(entity: any): string | null {
  const attrs = entity?.attributes ?? entity;
  const formats = attrs?.formats;
  return formats?.small?.url || formats?.thumbnail?.url || attrs?.url || null;
}

export function getMediaThumbUrls(media: any): string[] {
  if (!media) return [];
  if (Array.isArray(media)) return media.map(pickThumbUrl).map(absMediaUrl).filter((u: string | null): u is string => typeof u === "string");
  if (Array.isArray(media?.data)) return media.data.map(pickThumbUrl).map(absMediaUrl).filter((u: string | null): u is string => typeof u === "string");
  const url = media?.data ? pickThumbUrl(media.data) : pickThumbUrl(media);
  return url ? [absMediaUrl(url)!] : [];
}

export function getMediaThumbUrl(media: any): string | null { return getMediaThumbUrls(media)[0] ?? null; }

export function getCategorySlug(category: any): string | null {
  if (!category) return null;
  return category?.data?.attributes?.slug || category?.slug || null;
}

export async function getBlogPosts() {
  const path = `/api/blog-posts?fields[0]=Slug&fields[1]=updatedAt&pagination[pageSize]=100`;
  const res = await strapiFetch<any>(path, { revalidate: CACHE_REVALIDATE });
  const items = unwrapCollection(res);
  return items.map((x: any) => ({ slug: x.Slug || x.slug, updatedAt: x.updatedAt }));
}

export async function getPostBySlug(slug: string) {
  const path = `/api/blog-posts?filters[Slug][$eq]=${slug}&populate=*`;
  const res = await strapiFetch<any>(path, { revalidate: CACHE_REVALIDATE });
  const items = unwrapCollection(res);
  const x = items?.[0];
  if (!x) return null;
  return {
    id: x.id,
    title: x.Title || x.title,
    content: x.Content || x.content,
    summary: x.Summary || x.summary,
    coverImage: getMediaUrl(x.CoverImage || x.coverImage),
    seo: { metaTitle: x.seo?.metaTitle || x.Title || x.title, metaDescription: x.seo?.metaDescription || x.Summary || x.summary }
  };
}

export async function getCategories(): Promise<StrapiCategory[]> {
  const q = buildQuery({ sort: ["title:asc"], pagination: { pageSize: 200 } });
  const res = await strapiFetch<any>(`/api/categories${q}`, { revalidate: CACHE_REVALIDATE });
  return unwrapCollection(res) as StrapiCategory[];
}

export type StrapiCategory = { id: number; title: string; slug: string; description?: string; };

// ✅ DÜZELTME: Strapi v4/v5 Blocks (Zengin Metin) editör yapısını satır satır çözen kurşungeçirmez normalizasyon
function normalizeStringArray(input: any): string[] {
  if (!input) return [];
  let data = input;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { } }
  
  if (Array.isArray(data) && data.some(item => item && typeof item === "object")) {
    const lines: string[] = [];
    data.forEach((block: any) => {
      if (!block) return;
      
      // Strapi içerisindeki noktalı/numaralı liste blokları için koruma
      if ((block.type === "list" || block.type === "ordered-list") && Array.isArray(block.children)) {
        block.children.forEach((listItem: any) => {
          if (listItem && Array.isArray(listItem.children)) {
            const text = listItem.children.map((c: any) => c.text || "").join("").trim();
            if (text) lines.push(text);
          }
        });
        return;
      }
      
      // Standart paragraf ve text node blokları (Kalın/italik formatları birleştirir)
      if (Array.isArray(block.children)) {
        const text = block.children.map((c: any) => c.text || "").join("").trim();
        if (text) lines.push(text);
      } else if (typeof block.text === "string" && block.text.trim()) {
        lines.push(block.text.trim());
      }
    });
    if (lines.length > 0) return lines;
  }
  
  if (typeof data === "string") {
    if (data.includes("<li>")) {
      const matches = data.match(/<li>(.*?)<\/li>/gi);
      if (matches) return matches.map((m: string) => m.replace(/<\/?li>/gi, "").replace(/<\/?[^>]+(>|$)/g, "").trim()).filter(Boolean);
    }
    return data.split('\n').map((s: string) => s.replace(/<\/?[^>]+(>|$)/g, '').trim()).filter(Boolean);
  }
  if (Array.isArray(data)) {
    return data.filter(item => item && typeof item !== "object").map((item: any) => String(item).replace(/<\/?[^>]+(>|$)/g, "").trim()).filter(Boolean);
  }
  return [];
}

export async function getCatalogCategories(): Promise<{ key: string; label: string }[]> {
  const path = "/api/category-products?sort=order:asc&filters[isActive][$eq]=true&fields[0]=slug&fields[1]=title";
  // ✅ GÜNCELLEME: Işık hızında geçişler için FAST_REVALIDATE (10s) yapıldı
  const res = await strapiFetch<any>(path, { revalidate: FAST_REVALIDATE }); 
  const items = unwrapCollection(res);
  return items.map((x: AnyObj) => ({
    key: String(x?.slug ?? x?.id ?? ""),
    label: String(x?.title ?? x?.slug ?? "Kategori"),
  })).filter((x: any) => Boolean(x.key && x.label));
}

const PRODUCT_POPULATE = "&populate[0]=image&populate[1]=category_product&populate[2]=variants.VariantImage";

function mapCatalogProduct(x: AnyObj): any {
      const cat = unwrapRelation(x?.category_product);
      const imgField = x?.image;
      const imageUrls = (Array.isArray(imgField) ? imgField : [imgField]).map((m: any) => getMediaUrl(m)).filter((u: string | null): u is string => typeof u === "string");
      const imageThumbUrls = (Array.isArray(imgField) ? imgField : [imgField]).map((m: any) => getMediaThumbUrl(m)).filter((u: string | null): u is string => typeof u === "string");
      const mappedVariants = Array.isArray(x?.variants)
        ? x.variants.map((v: any) => {
            const variantImg = Array.isArray(v.VariantImage) ? v.VariantImage[0] : v.VariantImage;
            return {
              ColorName: v.ColorName || "",
              ColorCode: v.ColorCode || "",
              VariantImage: {
                url: getMediaUrl(variantImg) || "",
                thumbUrl: getMediaThumbUrl(variantImg) || "",
                displayUrl: absMediaUrl((variantImg?.attributes || variantImg)?.formats?.medium?.url) || getMediaUrl(variantImg) || "",
              },
            };
          }).filter((v: any) => v.ColorName !== "")
        : [];

      return {
        slug: x.slug || "",
        documentId: x.documentId,
        categoryTitle: cat?.title || "",
        createdAtISO: x.createdAt,
        updatedAt: x.updatedAt,
        id: String(x?.id ?? x?.documentId ?? ""),
        title: x?.title || x?.Title || "",
        category: String(cat?.slug ?? ""),
        featured: !!x?.featured,
        imageUrls,
        galleryImages: (Array.isArray(imgField) ? imgField : [imgField]).filter(Boolean).map((m: any) => ({
          original: getMediaUrl(m),
          display: absMediaUrl((m.attributes || m)?.formats?.medium?.url) || getMediaUrl(m),
          thumb: absMediaUrl((m.attributes || m)?.formats?.thumbnail?.url) || getMediaThumbUrl(m),
        })),
        imageUrl: imageUrls[0] || "",
        imageThumbUrl: imageThumbUrls[0] || imageUrls[0] || "",
        image: imageUrls[0] || "",
        wholesalePrice: x.wholesalePrice == null ? undefined : Number(x.wholesalePrice),
        minQty: x?.minQty ?? x?.MinQty ?? x?.min_qty ?? 1,
        bullets: normalizeStringArray(x?.bullets ?? x?.Bullets),
        specs: normalizeStringArray(x?.specs ?? x?.Specs),
        variants: mappedVariants,
        description: normalizeStringArray(x?.description || x?.Description)
      };
}

async function queryProducts(query: string, populate = true) {
  const res = await strapiFetch<any>(`/api/products?status=published&filters[isActive][$eq]=true&${query}${populate ? PRODUCT_POPULATE : ''}`, { revalidate: FAST_REVALIDATE, next: { tags: ['products'] } });
  return { items: unwrapCollection(res), pagination: res.meta?.pagination };
}

export async function getCatalogProducts(): Promise<any[]> {
  const result: any[] = [];
  for (let page = 1; ; page++) {
    const { items, pagination } = await queryProducts(`sort=order:asc&pagination[pageSize]=100&pagination[page]=${page}`);
    result.push(...items.map(mapCatalogProduct));
    if (!items.length || page >= (pagination?.pageCount || 1)) break;
  }
  return result;
}

export async function getProductBySlug(slug: string) {
  const { items } = await queryProducts(`filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`);
  if (items[0]) return mapCatalogProduct(items[0]);
  const aliases = await strapiFetch<any>(`/api/product-slugs?filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`, { revalidate: FAST_REVALIDATE, next: { tags: ['products'] } });
  const alias = unwrapCollection(aliases)[0];
  if (!alias) return null;
  const target = await queryProducts(`filters[documentId][$eq]=${encodeURIComponent(alias.targetDocumentId)}&pagination[pageSize]=1`);
  return target.items[0] ? mapCatalogProduct(target.items[0]) : null;
}

export async function getProductByLegacyId(id: string) {
  if (!/^\d+$/.test(id)) return null;
  const { items } = await queryProducts(`filters[id][$eq]=${id}&pagination[pageSize]=1`);
  return items[0] ? mapCatalogProduct(items[0]) : null;
}

export async function getRelatedProducts(product: any) {
  if (!product.category) return [];
  const { items } = await queryProducts(`filters[category_product][slug][$eq]=${encodeURIComponent(product.category)}&filters[documentId][$ne]=${encodeURIComponent(product.documentId)}&sort=order:asc&pagination[pageSize]=4`);
  return [...new Map<string, any>(items.map(mapCatalogProduct).filter((p: any) => p.slug && p.id !== product.id).map((p: any) => [p.documentId || p.id, p] as [string, any])).values()];
}

export async function getCatalogColorOptions() {
  const groups: Record<string, string[]> = {};
  for (let page = 1; ; page++) {
    const res = await strapiFetch<any>(`/api/products?status=published&filters[isActive][$eq]=true&fields[0]=id&populate[variants][fields][0]=ColorCode&pagination[pageSize]=100&pagination[page]=${page}`, { revalidate: FAST_REVALIDATE, next: { tags: ['products'] } });
    const items = unwrapCollection(res);
    for (const p of items) for (const v of p.variants || []) {
      if (!v.ColorCode) continue;
      const id = getClosestStandardColor(v.ColorCode).id;
      groups[id] = [...new Set([...(groups[id] || []), v.ColorCode])];
    }
    if (!items.length || page >= (res.meta?.pagination?.pageCount || 1)) break;
  }
  return { colors: STANDARD_COLORS.filter(c => groups[c.id]?.length), groups };
}

export async function getRelatedProductPage(product: any, search: URLSearchParams, page = 1) {
  const query = new URLSearchParams();
  const categories = (search.has('cats') ? search.get('cats') || '' : product.category).split(',').filter(Boolean).slice(0, 20);
  categories.forEach((cat: string, i: number) => query.set(`filters[category_product][slug][$in][${i}]`, cat));
  const selectedColors = (search.get('colors') || '').split(',').filter(Boolean);
  if (selectedColors.length) {
    const { groups } = await getCatalogColorOptions();
    const codes = [...new Set(selectedColors.flatMap(c => groups[c] || []))];
    if (!codes.length) return { products: [], hasMore: false, page };
    // Match the catalog's nearest-standard-color behavior, including products without variants.
    query.set('filters[$or][0][variants][id][$null]', 'true');
    codes.forEach((code, i) => query.set(`filters[$or][1][variants][ColorCode][$in][${i}]`, code));
  }
  const sorts: Record<string, string> = { newest: 'createdAt:desc', price_asc: 'wholesalePrice:asc', price_desc: 'wholesalePrice:desc', minqty_asc: 'minQty:asc', minqty_desc: 'minQty:desc' };
  query.set('sort[0]', sorts[search.get('sort') || 'newest'] || 'createdAt:desc');
  query.set('sort[1]', 'id:asc');
  query.set('filters[documentId][$ne]', product.documentId);
  if (search.get('q')?.trim()) query.set('filters[title][$containsi]', search.get('q')!.trim().slice(0, 200));
  query.set('pagination[pageSize]', '12');
  query.set('pagination[page]', String(page));
  const { items, pagination } = await queryProducts(query.toString());
  const products = [...new Map<string, any>(items.map(mapCatalogProduct).filter((p: any) => p.slug && p.documentId !== product.documentId).map((p: any) => [p.documentId || p.id, p] as [string, any])).values()];
  return { products, hasMore: page < (pagination?.pageCount || 1), page };
}

export async function getProductSitemapEntries() {
  const result: any[] = [];
  for (let page = 1; ; page++) {
    const { items, pagination } = await queryProducts(`fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=100&pagination[page]=${page}`, false);
    result.push(...items.filter((p: any) => p.slug));
    if (!items.length || page >= (pagination?.pageCount || 1)) break;
  }
  return result;
}

export async function getCustomProductTypes(): Promise<any[]> {
  const path = "/api/custom-product-types?sort=order:asc&filters[isActive][$eq]=true&populate[0]=image";
  const res = await strapiFetch<any>(path, { revalidate: CACHE_REVALIDATE });
  const items = unwrapCollection(res);
  return items.map((x: AnyObj) => ({
    id: String(x?.slug ?? ""),
    title: x?.title ?? "",
    image: getMediaUrl(x?.image) || "/products/placeholder.png",
  })).filter((x: { id: string; title: string }) => x.id && x.title);
}
