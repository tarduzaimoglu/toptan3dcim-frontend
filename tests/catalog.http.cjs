const assert = require('node:assert/strict');

async function main() {
  const origin = process.env.CATALOG_TEST_ORIGIN || 'http://localhost:3210';
  const source = await fetch('https://toptan3dcim.com/backend/api/products?status=published&filters[isActive][$eq]=true&pagination[pageSize]=3');
  assert.equal(source.status, 200);
  const products = (await source.json()).data;
  for (const product of products) {
    const path = `/urunler/${encodeURIComponent(product.slug)}`;
    const response = await fetch(`${origin}${path}?from=${encodeURIComponent('/products?cats=hayvan-anahtarlik&page=2')}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(product.title));
    assert.ok(html.includes(`<link rel="canonical" href="https://toptan3dcim.com${path}"`));
    assert.ok(html.includes('property="og:image"'));
    const structured = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap(m => JSON.parse(m[1]));
    const schema = structured.find(s => s['@type'] === 'Product');
    assert.equal(schema.name, product.title);
    assert.equal(schema.aggregateRating, undefined);
    assert.equal(schema.offers, undefined); // Existing price visibility switch stays off.
    assert.ok(structured.some(s => s['@type'] === 'BreadcrumbList'));
    const reload = await fetch(`${origin}${path}`);
    assert.equal(reload.status, 200);
    const legacy = await fetch(`${origin}/products?open=${product.id}&cats=hayvan-anahtarlik&page=2`, { redirect: 'manual' });
    assert.equal(legacy.status, 308);
    assert.ok(legacy.headers.get('location').startsWith(path));
    console.log(`PASS product, direct/reload, metadata and legacy 308: ${path}`);
  }
  const list = await fetch(`${origin}/products?cats=hayvan-anahtarlik&colors=red&sort=minqty_asc&page=2`);
  assert.equal(list.status, 200);
  const listHtml = await list.text();
  assert.ok(listHtml.includes('/urunler/'));
  assert.ok(listHtml.includes('from=%2Fproducts%3Fcats%3Dhayvan-anahtarlik'));
  assert.ok(!listHtml.includes('ProductExpandPanel'));
  const missing = await fetch(`${origin}/urunler/catalog-test-nonexistent-8675309`, { headers: { 'User-Agent': 'Googlebot' } });
  assert.equal(missing.status, 404);
  const sitemap = await fetch(`${origin}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  for (const p of products) assert.ok(xml.includes(`/urunler/${encodeURIComponent(p.slug)}`));
  console.log('PASS filtered catalog links, 404 and product sitemap');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
