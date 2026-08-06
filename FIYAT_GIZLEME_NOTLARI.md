# Fiyat Gizleme — Değişiklik Notu (2026-08-07)

## Amaç
Sitedeki tüm fiyat gösterimlerini (ürün kartı, ürün detayı, sepet, checkout,
WhatsApp sipariş mesajı, yazdırılabilir sipariş föyü, header promosyon şeridi)
**silmeden**, yalnızca görünürlük seviyesinde kapatmak. Strapi'deki fiyat verisi
ve backend'deki fiyat/ödeme hesaplama mantığı hiç değiştirilmedi — bu değişiklik
sadece frontend render katmanındadır.

## Geri almak için
`lib/config.ts` içindeki tek satırı değiştir:

```ts
export const SHOW_PRICES = true; // false yerine true
```

Bu, aşağıdaki listedeki tüm yerleri eski (fiyatlı) haline otomatik döndürür.
Backend'de hiçbir değişiklik yapılmadığı için başka bir işlem gerekmez.

## Yeni dosya
- `lib/config.ts` — `SHOW_PRICES` (false) ve `PRICE_HIDDEN_TEXT`
  ("Fiyat bilgisi için WhatsApp üzerinden iletişime geçebilirsiniz") sabitleri.

## Değiştirilen dosyalar ve neyin gizlendiği

| Dosya | Ne gizlendi |
|---|---|
| `components/products/ProductCard.tsx` | Ürün kartındaki birim fiyat metni → placeholder metin (min. adet rozeti kaldı) |
| `components/ProductCarousel.tsx` | Anasayfa slider'ındaki "{fiyat} TL / Adet" → placeholder metin |
| `components/products/ProductExpandPanel.tsx` | Ürün detay panelindeki birim fiyat → placeholder metin (Sepete Ekle butonu aynen çalışıyor) |
| `components/products/ProductFilter.tsx` | "Fiyat: Düşükten Yükseğe / Yüksekten Düşüğe" sıralama seçenekleri kaldırıldı (masaüstü + mobil select) |
| `app/cart/page.tsx` | Sepet satırlarında birim fiyat + satır toplamı gizlendi (sadece ürün adı, min/max adet, adet kontrolü kaldı); ücretsiz kargo ilerleme çubuğu gizlendi; sağdaki "Özet" kutusu (ara toplam/KDV/indirim/kargo/genel toplam) → çeşit + toplam adet + placeholder metne döndü |
| `app/cart/page.tsx` (`handleWhatsAppOrder`) | WhatsApp'a giden otomatik sipariş mesajındaki fiyat/toplam satırları kaldırıldı → sadece ürün adı + adet listesi + placeholder metin gönderiliyor |
| `app/cart/page.tsx` (`buildPrintableHtml` çağrısı) | Fiyat detaylı yazdırılabilir PDF föyü artık açılmıyor (fonksiyonun kendisi dokunulmadan duruyor, sadece çağrısı `SHOW_PRICES` şartına bağlandı) |
| `app/checkout/page.tsx` | Sipariş özetindeki satır fiyatları ve toplamlar (ara toplam/KDV/kargo/genel toplam) gizlendi → placeholder metin |
| `components/Header.tsx` | Üst promosyon şeridindeki rakam/oran içeren satırlar ("1500₺ Üzeri Kargo Ücretsiz", "%3 Havale/EFT İndirimi") gizlendi; "9 Aya Varan Taksit İmkânı" satırı (rakam fiyat değil, taksit sayısı olduğu için) kaldı |

## Dokunulmayan yerler (bilerek)
- **Backend** (`toptan3dcim-backend`): Hiç değiştirilmedi. Ödeme/sipariş akışı
  fiyatı Strapi'den kendisi çekip hesaplıyor ve doğruluyor; frontend zaten
  fiyat göndermiyordu (`items: [{productId, qty, variant}]`).
- **Strapi admin paneli**: Ürün fiyatları (`wholesalePrice`) olduğu gibi
  görünmeye devam ediyor — bu sadece site yöneticisinin (senin) göreceği bir
  yer, halka açık site değil.
- `lib/pricing.ts`, `lib/strapi.ts`, `components/cart/CartContext.tsx`:
  Fiyat hesaplama/veri çekme mantığı aynen duruyor (sadece UI'da gösterilmiyor).
  Bu sayede `SHOW_PRICES = true` yapıldığında hiçbir veri kaybı olmadan anında
  eski haline döner.
