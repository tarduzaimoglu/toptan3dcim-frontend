import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, getRelatedProductPage } from '@/lib/strapi';

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const slug = search.get('slug');
  const page = Number(search.get('page') || 1);
  if (!slug || slug.length > 200 || !Number.isSafeInteger(page) || page < 1 || page > 1000) return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  try {
    const product = await getProductBySlug(slug);
    if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    return NextResponse.json(await getRelatedProductPage(product, search, page));
  } catch {
    return NextResponse.json({ error: 'Ürün önerileri yüklenemedi' }, { status: 503 });
  }
}
