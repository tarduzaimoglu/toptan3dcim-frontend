// lib/strapi.ts

type AnyObj = Record<string, any>;

// ✅ Tek kaynak: Strapi base URL
export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") || "http://localhost:1337";

const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

/** Strapi v4/v5 REST response formatlarını normalize eder */
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

/** URLSearchParams ile Strapi query üret */
export function buildQuery(params: Record<string, any>) {
  const sp = new URLSearchParams();

  const add = (key: string, val: any) => {
    if (val === undefined || val === null || val === "") return;
    sp.set(key, String(val));
  };

  if (params.filters?.slug?.$eq) add("filters[slug][$eq]", params.filters.slug.$eq);
  if (params.filters?.category?.slug?.$eq)
    add("filters[category][slug][$eq]", params.filters.category.slug.$eq);

  if (Array.isArray(params.sort)) {
    params.sort.forEach((s: string, i: number) => add(`sort[${i}]`, s));
  }

  if (params.pagination?.pageSize) add("pagination[pageSize]", params.pagination.pageSize);

  if (params.populate) {
    const pop = params.populate;
    const pushFields = (prefix: string, fields: any[]) => {
      fields.forEach((f, i) => add(`populate[${prefix}][fields][${i}]`, f));
    };

    const pushPopulate = (prefix: string, value: any) => {
      if (value === undefined || value === null) return;
      if (value === true || value === "*") {
        add(`populate[${prefix}]`, "*");
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((child) => {
          if (!child) return;
          add(`populate[${prefix}][populate][${String(child)}]`, "*");
        });
        return;
      }
      if (typeof value === "object") {
        if (Array.isArray(value.fields)) pushFields(prefix, value.fields);
        if (value.populate) {
          const p = value.populate;
          if (p === "*" || p === true) {
            add(`populate[${prefix}][populate]`, "*");
          } else if (Array.isArray(p)) {
            p.forEach((child) => {
              if (!child) return;
              add(`populate[${prefix}][populate][${String(child)}]`, "*");
            });
          } else if (typeof p === "object") {
            Object.keys(p).forEach((k) => {
              pushPopulate(`${prefix}][populate][${k}`, p[k]);
            });
          }
        }
      }
    };

    if (typeof pop === "string") {
      add("populate", pop);
    } else if (Array.isArray(pop)) {
      pop.forEach((field) => {
        if (!field) return;
        if (String(field) === "coverImage") {
          pushPopulate("coverImage", { fields: ["url", "alternativeText", "formats"] });
        } else {
          add(`populate[${String(field)}]`, "*");
        }
      });
    } else if (typeof pop === "object") {
      for (const k of Object.keys(pop)) {
        const v = pop[k];
        if (k === "coverImage" && (v === "*" || v === true)) {
          pushPopulate("coverImage", { fields: ["url", "alternativeText", "formats"] });
        } else {
          pushPopulate(k, v);
        }
      }
    }
  }

  const q = sp.toString();
  return q ? `?${q}` : "";
}

export async function strapiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${STRAPI_URL}${path}`;
  const headers = new Headers(init?.headers);
  if (STRAPI_TOKEN) headers.set("Authorization", `Bearer ${STRAPI_TOKEN}`);

  const res = await fetch(url, {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
    next: (init as any)?.next ?? { revalidate: 0 },
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Strapi error ${res.status} on ${path}: ${txt}`);
  }
  return (await res.json()) as T;
}

/* ---------------------------------------
   ✅ MEDIA HELPERS
---------------------------------------- */

function absMediaUrl(maybeRelativeUrl?: string | null) {
  if (!maybeRelativeUrl) return null;
  if (typeof maybeRelativeUrl === "string" && maybeRelativeUrl.startsWith("http")) return maybeRelativeUrl;
  return `${STRAPI_URL}${maybeRelativeUrl}`;
}

export function getMediaUrls(media: any): string[] {
  if (!media) return [];
  if (Array.isArray(media)) {
    return (media as any[])
      .map((x: any) => x?.url ?? x?.attributes?.url)
      .map(absMediaUrl)
      .filter((u): u is string => typeof u === "string" && u.length > 0);
  }
  if (Array.isArray(media?.data)) {
    return (media.data as any[])
      .map((x: any) => x?.attributes?.url ?? x?.url)
      .map(absMediaUrl)
      .filter((u): u is string => typeof u === "string" && u.length > 0);
  }
  const v4Single = media?.data?.attributes?.url;
  if (typeof v4Single === "string" && v4Single) {
    const u = absMediaUrl(v4Single);
    return u ? [u] : [];
  }
  const v5Single = media?.data?.url ?? media?.data?.attributes?.url;
  if (typeof v5Single === "string" && v5Single) {
    const u = absMediaUrl(v5Single);
    return u ? [u] : [];
  }
  const v5Url = media?.url;
  if (typeof v5Url === "string" && v5Url) {
    const u = absMediaUrl(v5Url);
    return u ? [u] : [];
  }
  return [];
}

export function getMediaUrl(media: any): string | null {
  return getMediaUrls(media)[0] ?? null;
}

export function getCategorySlug(category: any): string | null {
  if (!category) return null;
  const v4 = category?.data?.attributes?.slug;
  const v5 = category?.slug;
  return v4 || v5 || null;
}

/* -----------------------------
   BLOG API
------------------------------ */

export type StrapiCategory = {
  id: number;
  title: string;
  slug: string;
  description?: string;
};

/** ✅ Sitemap için tüm blog yazılarını getirir */
export async function getBlogPosts() {
  const path = `/api/blog-posts?fields[0]=Slug&fields[1]=updatedAt&pagination[pageSize]=100`;
  const res = await strapiFetch<any>(path);
  const items = unwrapCollection(res);
  return items.map((x: any) => ({
    slug: x.Slug || x.slug,
    updatedAt: x.updatedAt
  }));
}

/** ✅ Blog Yazısını Slug ile Getirir */
export async function getPostBySlug(slug: string) {
  const path = `/api/blog-posts?filters[Slug][$eq]=${slug}&populate=*`;
  
  const res = await strapiFetch<any>(path);
  const items = unwrapCollection(res);
  const x = items?.[0];
  
  if (!x) return null;

  return {
    id: x.id,
    title: x.Title || x.title,       
    content: x.Content || x.content, 
    summary: x.Summary || x.summary, 
    coverImage: getMediaUrl(x.CoverImage || x.coverImage),
    seo: {
      metaTitle: x.seo?.metaTitle || x.Title || x.title,
      metaDescription: x.seo?.metaDescription || x.Summary || x.summary,
      keywords: x.seo?.keywords || "",
      shareImage: getMediaUrl(x.seo?.shareImage),
    }
  };
}

export async function getCategories(): Promise<StrapiCategory[]> {
  const q = buildQuery({
    sort: ["title:asc"],
    pagination: { pageSize: 200 },
  });
  const res = await strapiFetch<any>(`/api/categories${q}`);
  return unwrapCollection(res);
}

/* ---------------------------------------
   CATALOG / PRODUCTS
---------------------------------------- */

function normalizeStringArray(input: any): string[] {
  if (!input) return [];
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      return [];
    } catch { return []; }
  }
  if (Array.isArray(input)) return input.map(String).filter(Boolean);
  return [];
}

export async function getCatalogCategories(): Promise<{ key: string; label: string }[]> {
  const path = "/api/category-products?sort=order:asc&filters[isActive][$eq]=true&fields[0]=slug&fields[1]=title";
  const res = await strapiFetch<any>(path);
  const items = unwrapCollection(res);
  return items.map((x: AnyObj) => ({
    key: String(x?.slug ?? x?.id ?? ""),
    label: String(x?.title ?? x?.slug ?? "Kategori"),
  })).filter((x: any) => Boolean(x.key && x.label));
}

export async function getCatalogProducts(): Promise<any[]> {
  // YENİ: URL'ye varyantları ve varyant resimlerini getirmesi için gerekli parametreleri ekledik
  const path = "/api/products?sort=order:asc&pagination[pageSize]=200&filters[isActive][$eq]=true&populate[0]=image&populate[1]=category_product&populate[variants][populate]=VariantImage&fields[0]=title&fields[1]=featured&fields[2]=wholesalePrice&fields[3]=minQty";
  
  const res = await strapiFetch<any>(path);
  const items = unwrapCollection(res);

  return items.map((x: AnyObj) => {
    const cat = unwrapRelation(x?.category_product);
    const imgField = x?.image;
    const imageUrls = (Array.isArray(imgField) ? imgField : [imgField])
      .map((m: any) => getMediaUrl(m))
      .filter((u): u is string => typeof u === "string");

    // YENİ: Gelen raw varyant datasını Next.js'in anlayacağı şekle çeviriyoruz
    const mappedVariants = Array.isArray(x?.variants) 
      ? x.variants.map((v: any) => ({
          ColorName: v.ColorName || "",
          ColorCode: v.ColorCode || "",
          // VariantImage'ın URL'sini getMediaUrl fonksiyonunla güvenli şekilde alıyoruz
          VariantImage: { url: getMediaUrl(v.VariantImage) || "" } 
        })).filter((v: any) => v.ColorName !== "") // Boş varyantları süzüyoruz
      : [];

    return {
      id: String(x?.id ?? x?.documentId ?? ""),
      title: x?.title || "",
      category: String(cat?.slug ?? ""),
      featured: !!x?.featured,
      imageUrls,
      image: imageUrls[0] || "",
      wholesalePrice: x?.wholesalePrice,
      minQty: x?.minQty,
      bullets: normalizeStringArray(x?.bullets),
      specs: normalizeStringArray(x?.specs),
      variants: mappedVariants // YENİ: Varyantları döndürüyoruz
    };
  });
}

export async function getCustomProductTypes(): Promise<any[]> {
  const path = "/api/custom-product-types?sort=order:asc&filters[isActive][$eq]=true&populate[0]=image";
  const res = await strapiFetch<any>(path);
  const items = unwrapCollection(res);
  return items.map((x: AnyObj) => ({
    id: String(x?.id ?? ""),
    title: x?.title ?? "",
    slug: x?.slug ?? "",
    image: getMediaUrl(x?.image) || "/products/placeholder.png",
  }));
}