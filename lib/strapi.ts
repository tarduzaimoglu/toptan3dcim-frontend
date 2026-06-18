type AnyObj = Record<string, any>;

export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";
const CACHE_REVALIDATE = 3600;

function unwrapEntity(entity: any) {
  if (entity && typeof entity === "object" && "attributes" in entity) {
    return { id: entity.id, ...entity.attributes };
  }
  return entity;
}

function unwrapCollection(res: any) {
  const arr = Array.isArray(res?.data) ? res.data : [];
  return arr.map(unwrapEntity).filter(Boolean);
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
      : { next: { revalidate: revalidateVal } }
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
  if (typeof maybeRelativeUrl === "string" && maybeRelativeUrl.startsWith("http")) return maybeRelativeUrl;
  return `${STRAPI_URL}${maybeRelativeUrl}`;
}

export function getMediaUrls(media: any): string[] {
  if (!media) return [];
  if (Array.isArray(media)) return media.map((x: any) => x?.url ?? x?.attributes?.url).map(absMediaUrl).filter((u: string | null): u is string => typeof u === "string");
  if (Array.isArray(media?.data)) return media.data.map((x: any) => x?.attributes?.url ?? x?.url).map(absMediaUrl).filter((u: string | null): u is string => typeof u === "string");
  const url = media?.data?.attributes?.url || media?.data?.url || media?.url;
  return url ? [absMediaUrl(url)!] : [];
}

export function getMediaUrl(media: any): string | null { return getMediaUrls(media)[0] ?? null; }

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
  return unwrapCollection(res);
}

export type StrapiCategory = { id: number; title: string; slug: string; description?: string; };

function normalizeStringArray(input: any): string[] {
  if (!input) return [];
  let data = input;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { } }
  if (Array.isArray(data) && data.some(item => item && typeof item === "object")) {
    let extractedText = "";
    const extractRecursively = (node: any) => {
      if (!node) return;
      if (typeof node === "string") { extractedText += node + "\n"; return; }
      if (node.type === "text" && node.text) { extractedText += node.text + "\n"; return; }
      if (Array.isArray(node.children)) { node.children.forEach(extractRecursively); }
    };
    data.forEach(extractRecursively);
    data = extractedText;
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
  const res = await strapiFetch<any>(path, { revalidate: 0 }); 
  const items = unwrapCollection(res);
  return items.map((x: AnyObj) => ({
    key: String(x?.slug ?? x?.id ?? ""),
    label: String(x?.title ?? x?.slug ?? "Kategori"),
  })).filter((x: any) => Boolean(x.key && x.label));
}

export async function getCatalogProducts(): Promise<any[]> {
  // GÜNCELLEME: bullets ve specs alanları sorguda zorla populate listesine eklendi
  const path = "/api/products?sort=order:asc&pagination[pageSize]=200&filters[isActive][$eq]=true" +
               "&populate[0]=image" +
               "&populate[1]=category_product" +
               "&populate[2]=variants.VariantImage" +
               "&populate[3]=bullets" +
               "&populate[4]=specs";
               
  const res = await strapiFetch<any>(path, { revalidate: 0 }); 
  const items = unwrapCollection(res);
  return items.map((x: AnyObj) => {
    const cat = unwrapRelation(x?.category_product);
    const imgField = x?.image;
    const imageUrls = (Array.isArray(imgField) ? imgField : [imgField]).map((m: any) => getMediaUrl(m)).filter((u: string | null): u is string => typeof u === "string");
    const mappedVariants = Array.isArray(x?.variants) 
      ? x.variants.map((v: any) => ({
          ColorName: v.ColorName || "",
          ColorCode: v.ColorCode || "",
          VariantImage: { url: getMediaUrl(Array.isArray(v.VariantImage) ? v.VariantImage[0] : v.VariantImage) || "" } 
        })).filter((v: any) => v.ColorName !== "")
      : [];
      
    return {
      id: String(x?.id ?? x?.documentId ?? ""),
      title: x?.title || x?.Title || "",
      category: String(cat?.slug ?? ""),
      featured: !!x?.featured,
      imageUrls,
      imageUrl: imageUrls[0] || "",
      image: imageUrls[0] || "", 
      wholesalePrice: x?.wholesalePrice ?? x?.WholesalePrice ?? x?.wholesale_price,
      // GÜNCELLEME: minQty için veritabanı harf/alt çizgi varyasyonlarına karşı koruma eklendi
      minQty: x?.minQty ?? x?.MinQty ?? x?.min_qty ?? 1,
      bullets: normalizeStringArray(x?.bullets ?? x?.Bullets),
      specs: normalizeStringArray(x?.specs ?? x?.Specs),
      variants: mappedVariants,
      description: x?.description || x?.Description || ""
    };
  });
}

export async function getCustomProductTypes(): Promise<any[]> {
  const path = "/api/custom-product-types?sort=order:asc&filters[isActive][$eq]=true&populate[0]=image";
  const res = await strapiFetch<any>(path, { revalidate: CACHE_REVALIDATE });
  const items = unwrapCollection(res);
  return items.map((x: AnyObj) => ({
    id: String(x?.id ?? ""),
    title: x?.title ?? "",
    slug: x?.slug ?? "",
    image: getMediaUrl(x?.image) || "/products/placeholder.png",
  }));
}
