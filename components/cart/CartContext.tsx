"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products/types";
import { discountPerUnitTRY, effectiveUnitPriceTRY } from "@/lib/pricing";

export const CART_MIN_QTY = 1;
export const CART_MAX_QTY = 2000;
export const CART_STEP = 1;

export const FALLBACK_UNIT_PRICE = 25;

const STORAGE_KEY = "kesiolabs_cart_v1";

/**
 * ✅ dynamicClamp: Ürünün kendi minQty değerine göre kısıtlama yapar.
 * Dışarıdaki clampQty artık bu mantığı kullanacak.
 */
function dynamicClamp(qty: number, minAllowed: number) {
  if (!Number.isFinite(qty)) return minAllowed;
  return Math.min(CART_MAX_QTY, Math.max(minAllowed, qty));
}

export type CartItemVariant = { colorName: string };

type StoredCartItem = {
  id: string;
  productId: string;
  variant?: CartItemVariant | null;
  qty: number;
  product: {
    id: string;
    title: string;
    imageUrl?: string;
    wholesalePrice?: number;
    minQty?: number; // ✅ Storage'da saklıyoruz
  };
};

export type CartItem = {
  /** Satır anahtarı (UI'da tekilliği sağlar): productId + varyant kombinasyonu olabilir. */
  id: string;
  /** Backend'e (Strapi) giden saf ürün id'si — asla varyant bilgisiyle birleştirilmez. */
  productId: string;
  variant?: CartItemVariant | null;
  product: Product & {
    wholesalePrice?: number;
    imageUrl?: string;
    minQty?: number; // ✅ Tip tanımına eklendi
  };
  qty: number;
};

type AddPayload = {
  /** Saf Strapi ürün id'si. */
  id: string;
  title: string;
  price?: number;
  image?: string;
  qty?: number;
  minQty?: number; // ✅ Panelden gelen minQty
  variant?: CartItemVariant | null;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  qtyCount: number;
  hydrated: boolean;
  unitPriceOf: (rowId: string) => number;
  discountPerUnitOf: (rowId: string) => number;
  effectiveUnitPriceOf: (rowId: string) => number;
  lineTotalOf: (rowId: string) => number;
  cartTotal: number;
  addItem: (payload: AddPayload) => void;
  setQty: (rowId: string, qty: number) => void;
  inc: (rowId: string, step?: number) => void;
  dec: (rowId: string, step?: number) => void;
  remove: (rowId: string) => void;
  clear: () => void;
};

const CartCtx = createContext<CartContextValue | null>(null);

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Eski sepet formatı (v1 öncesi): id "256-Kırmızı" gibi productId+renk birleşimiydi
 * ve product.id de aynı bileşik değeri taşıyordu. Ayrıştırılabilirse {productId, colorName}
 * döner, aksi halde null (satır sessizce düşürülür).
 */
function parseLegacyCompositeId(id: string): { productId: string; colorName: string } | null {
  const match = /^(\d+)-(.+)$/.exec(id);
  if (!match) return null;
  const colorName = match[2].trim();
  if (!colorName) return null;
  return { productId: match[1], colorName };
}

function normalizeStoredItems(input: any): CartItem[] {
  if (!Array.isArray(input)) return [];
  const normalized: CartItem[] = [];

  for (const it of input) {
    if (!it || typeof it !== "object") continue;
    const p = it.product && typeof it.product === "object" ? it.product : {};
    const title = typeof p.title === "string" ? p.title : "";
    if (!title) continue;

    let productId: string | null = null;
    let variant: CartItemVariant | null = null;
    let rowId: string | null = null;

    if (typeof it.productId === "string" && it.productId) {
      // Güncel format
      productId = it.productId;
      variant =
        it.variant && typeof it.variant === "object" && typeof it.variant.colorName === "string" && it.variant.colorName
          ? { colorName: it.variant.colorName }
          : null;
      rowId = typeof it.id === "string" && it.id ? it.id : variant ? `${productId}-${variant.colorName}` : productId;
    } else if (typeof it.id === "string" && it.id) {
      // Eski format: bileşik ya da düz id olabilir
      const legacy = parseLegacyCompositeId(it.id);
      if (legacy) {
        productId = legacy.productId;
        variant = { colorName: legacy.colorName };
      } else {
        productId = it.id;
        variant = null;
      }
      rowId = it.id;
    }

    if (!productId || !rowId) continue; // ayrıştırılamayan satır sessizce düşürülür

    // Her ürünün kendi min sınırını normalize et
    const minAllowed = typeof p.minQty === "number" ? p.minQty : CART_MIN_QTY;
    const qty = dynamicClamp(Number(it.qty), minAllowed);

    const product = {
      id: productId,
      title,
      imageUrl: p.imageUrl,
      wholesalePrice: p.wholesalePrice,
      minQty: p.minQty,
    } as any as Product;

    normalized.push({ id: rowId, productId, variant, qty, product });
  }
  return normalized;
}

function toStored(items: CartItem[]): StoredCartItem[] {
  return items.map((it) => ({
    id: it.id,
    productId: it.productId,
    variant: it.variant ?? null,
    qty: it.qty,
    product: {
      id: it.product?.id ?? it.productId,
      title: (it.product as any)?.title ?? "",
      imageUrl: (it.product as any)?.imageUrl,
      wholesalePrice: (it.product as any)?.wholesalePrice,
      minQty: (it.product as any)?.minQty,
    },
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = safeJsonParse<any>(localStorage.getItem(STORAGE_KEY));
    const maybeItems = Array.isArray(saved?.items) ? saved.items : Array.isArray(saved) ? saved : null;
    if (maybeItems) {
      setItems(normalizeStoredItems(maybeItems));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: toStored(items) }));
  }, [items, hydrated]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const saved = safeJsonParse<any>(e.newValue);
      const maybeItems = Array.isArray(saved?.items) ? saved.items : Array.isArray(saved) ? saved : null;
      if (!maybeItems) {
        setItems([]);
        return;
      }
      const normalized = normalizeStoredItems(maybeItems);
      setItems((prev) => {
        const a = JSON.stringify(toStored(prev));
        const b = JSON.stringify(toStored(normalized));
        return a === b ? prev : normalized;
      });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.length;
    const qtyCount = items.reduce((sum, it) => sum + (it.qty || 0), 0);
    // Not: aşağıdaki yardımcılar satır anahtarı (CartItem.id) üzerinden çalışır,
    // saf Strapi productId üzerinden değil — sepette aynı ürünün renk varyantları
    // ayrı satır olarak durabildiği için doğru satırı bulmak satır anahtarını gerektirir.
    const findItem = (rowId: string) => items.find((x) => x.id === rowId);

    const unitPriceOf = (rowId: string) => {
      const it = findItem(rowId);
      const base = it?.product?.wholesalePrice;
      return typeof base === "number" ? base : FALLBACK_UNIT_PRICE;
    };

    const discountPerUnitOf = (rowId: string) => {
      const it = findItem(rowId);
      const q = it?.qty ?? CART_MIN_QTY;
      return discountPerUnitTRY(q);
    };

    const effectiveUnitPriceOf = (rowId: string) => {
      const base = unitPriceOf(rowId);
      const it = findItem(rowId);
      const q = it?.qty ?? CART_MIN_QTY;
      return effectiveUnitPriceTRY(base, q);
    };

    const lineTotalOf = (rowId: string) => {
      const it = findItem(rowId);
      if (!it) return 0;
      const base = unitPriceOf(rowId);
      return effectiveUnitPriceTRY(base, it.qty) * it.qty;
    };

    const cartTotal = items.reduce((sum, it) => {
      const base = it.product?.wholesalePrice ?? FALLBACK_UNIT_PRICE;
      return sum + effectiveUnitPriceTRY(base, it.qty) * it.qty;
    }, 0);

    const setQty = (rowId: string, qty: number) => {
      setItems((prev) => prev.map((x) => {
        if (x.id === rowId) {
          const min = (x.product as any)?.minQty ?? CART_MIN_QTY;
          return { ...x, qty: dynamicClamp(qty, min) };
        }
        return x;
      }));
    };

    const inc = (rowId: string, step = CART_STEP) => {
      setItems((prev) => prev.map((x) => {
        if (x.id !== rowId) return x;
        const min = (x.product as any)?.minQty ?? CART_MIN_QTY;
        return { ...x, qty: dynamicClamp((x.qty || min) + step, min) };
      }));
    };

    const dec = (rowId: string, step = CART_STEP) => {
      setItems((prev) => prev.map((x) => {
        if (x.id !== rowId) return x;
        const min = (x.product as any)?.minQty ?? CART_MIN_QTY;
        return { ...x, qty: dynamicClamp((x.qty || min) - step, min) };
      }));
    };

    const addItem = (payload: AddPayload) => {
      const minQtyRule = payload.minQty ?? CART_MIN_QTY;
      const incomingQty = dynamicClamp(payload.qty ?? minQtyRule, minQtyRule);
      const incomingBasePrice = typeof payload.price === "number" ? payload.price : FALLBACK_UNIT_PRICE;
      const variant = payload.variant ?? null;
      // Satır anahtarı: aynı ürünün farklı renkleri sepette ayrı satır olarak kalsın,
      // ama backend'e giden productId (payload.id) hep saf kalır.
      const rowId = variant?.colorName ? `${payload.id}-${variant.colorName}` : payload.id;

      setItems((prev) => {
        const idx = prev.findIndex((x) => x.id === rowId);
        if (idx >= 0) {
          const copy = [...prev];
          const existing = copy[idx];
          const min = (existing.product as any)?.minQty ?? CART_MIN_QTY;
          const nextQty = dynamicClamp((existing.qty || min) + incomingQty, min);

          copy[idx] = {
            ...existing,
            qty: nextQty,
            product: { ...existing.product, wholesalePrice: incomingBasePrice, minQty: payload.minQty }
          };
          return copy;
        }

        const product = {
          id: payload.id,
          title: payload.title,
          imageUrl: payload.image,
          wholesalePrice: incomingBasePrice,
          minQty: payload.minQty,
        } as any as Product;

        return [...prev, { id: rowId, productId: payload.id, variant, product, qty: incomingQty }];
      });
    };

    const remove = (rowId: string) => setItems((prev) => prev.filter((x) => x.id !== rowId));
    const clear = () => setItems([]);

    return {
      items, itemCount, qtyCount, hydrated,
      unitPriceOf, discountPerUnitOf, effectiveUnitPriceOf, lineTotalOf, cartTotal,
      addItem, setQty, inc, dec, remove, clear,
    };
  }, [items, hydrated]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}