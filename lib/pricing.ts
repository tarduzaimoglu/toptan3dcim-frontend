// lib/pricing.ts

// Ürün fiyatları (wholesalePrice) KDV DAHİLDİR. Bu oran backend'deki
// toptan3dcim-backend/src/api/payment/services/payment.ts VAT_RATE=0.2 ile
// birebir aynı tutulmalıdır (dahil KDV = toplam * oran/(1+oran)).
export const VAT_RATE = 0.2;

// Kargo: sepet toplamı (indirimli, KDV dahil) bu eşiğin üzerindeyse ücretsiz,
// altındaysa sabit ücret uygulanır.
export const FREE_SHIPPING_THRESHOLD = 1500;
export const SHIPPING_FEE = 200;

export function vatInclusiveAmount(total: number) {
  return total * (VAT_RATE / (1 + VAT_RATE));
}

export function shippingFeeFor(subtotal: number) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export function discountPerUnitTRY(qty: number) {
  if (!Number.isFinite(qty) || qty <= 0) return 0;

  // Kademe tablosu (adet başı indirim)
  if (qty >= 2000) return 3.0;
  if (qty >= 1500) return 1.5;
  if (qty >= 1000) return 0.75;
  if (qty >= 500) return 0.5;

  return 0;
}

export function effectiveUnitPriceTRY(basePrice: number, qty: number) {
  const d = discountPerUnitTRY(qty);
  const p = basePrice - d;
  return Math.max(p, 0);
}
