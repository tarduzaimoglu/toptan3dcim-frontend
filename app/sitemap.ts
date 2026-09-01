import { MetadataRoute } from 'next';
import { getBlogPosts } from '@/lib/strapi';

type SitemapPost = {
  slug: string;
  updatedAt?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Strapi'deki tüm blog yazılarını (Slug ve Tarih) çekiyoruz
  let posts: Awaited<ReturnType<typeof getBlogPosts>> = [];
  try {
    posts = await getBlogPosts();
  } catch (error) {
    console.error("Sitemap blog verisi alınamadı:", error);
  }
  
  const blogUrls = (posts as SitemapPost[]).map((post) => ({
    url: `https://toptan3dcim.com/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Sabit sayfalarınız
  const routes = ['', '/products', '/teklif-al', '/custom-products', '/contact'].map((route) => ({
    url: `https://toptan3dcim.com${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes, ...blogUrls];
}
