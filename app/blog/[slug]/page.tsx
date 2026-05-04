import { getPostBySlug } from "@/lib/strapi";
import { notFound } from "next/navigation";
import { Metadata } from "next";
// ✅ Yeni renderer'ı içe aktar
import { BlocksRenderer } from "@strapi/blocks-react-renderer";

type Props = {
  params: Promise<{ slug: string }>;
};

// ... generateMetadata kısmı aynı kalabilir ...

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-slate-900">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 leading-tight">
        {post.title}
      </h1>
      
      {post.coverImage && (
        <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* ✅ HTML dangerouslySet yerine BlocksRenderer kullanıyoruz */}
      <article className="prose prose-lg prose-orange max-w-none">
        {post.content ? (
          <BlocksRenderer content={post.content} />
        ) : (
          <p>İçerik bulunamadı.</p>
        )}
      </article>

      <div className="mt-20 p-8 rounded-3xl bg-orange-50 border border-orange-100">
        <h3 className="text-xl font-bold text-orange-900 mb-2">İlginizi çekebilir</h3>
        <p className="text-orange-800 mb-4">Blog yazımızda bahsettiğimiz ürünleri ve daha fazlasını kataloğumuzda bulabilirsiniz.</p>
        <a href="/products" className="inline-block bg-[#ff7a00] text-white px-6 py-3 rounded-xl font-bold">
          Kataloğu İncele
        </a>
      </div>
    </main>
  );
}