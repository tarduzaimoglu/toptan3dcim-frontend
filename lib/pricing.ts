// lib/pricing.ts

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
