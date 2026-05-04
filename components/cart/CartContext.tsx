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

type StoredCartItem = {
  id: string;
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
  id: string;
  product: Product & {
    wholesalePrice?: number;
    imageUrl?: string;
    minQty?: number; // ✅ Tip tanımına eklendi
  };
  qty: number;
};

type AddPayload = {
  id: string;
  title: string;
  price?: number;
  image?: string;
  qty?: number;
  minQty?: number; // ✅ Panelden gelen minQty
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  qtyCount: number;
  hydrated: boolean;
  unitPriceOf: (productId: string) => number;
  discountPerUnitOf: (productId: string) => number;
  effectiveUnitPriceOf: (productId: string) => number;
  lineTotalOf: (productId: string) => number;
  cartTotal: number;
  addItem: (payload: AddPayload) => void;
  setQty: (productId: string, qty: number) => void;
  inc: (productId: string, step?: number) => void;
  dec: (productId: string, step?: number) => void;
  remove: (productId: string) => void;
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

function normalizeStoredItems(input: any): CartItem[] {
  if (!Array.isArray(input)) return [];
  const normalized: CartItem[] = [];

  for (const it of input) {
    if (!it || typeof it !== "object") continue;
    const id = typeof it.id === "string" ? it.id : null;
    const p = it.product && typeof it.product === "object" ? it.product : {};
    const title = typeof p.title === "string" ? p.title : "";
    
    if (!id || !title) continue;

    // Her ürünün kendi min sınırını normalize et
    const minAllowed = typeof p.minQty === "number" ? p.minQty : CART_MIN_QTY;
    const qty = dynamicClamp(Number(it.qty), minAllowed);

    const product = {
      id,
      title,
      imageUrl: p.imageUrl,
      wholesalePrice: p.wholesalePrice,
      minQty: p.minQty,
    } as any as Product;

    normalized.push({ id, qty, product });
  }
  return normalized;
}

function toStored(items: CartItem[]): StoredCartItem[] {
  return items.map((it) => ({
    id: it.id,
    qty: it.qty,
    product: {
      id: it.product?.id ?? it.id,
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
    const findItem = (productId: string) => items.find((x) => x.id === productId);

    const unitPriceOf = (productId: string) => {
      const it = findItem(productId);
      const base = it?.product?.wholesalePrice;
      return typeof base === "number" ? base : FALLBACK_UNIT_PRICE;
    };

    const discountPerUnitOf = (productId: string) => {
      const it = findItem(productId);
      const q = it?.qty ?? CART_MIN_QTY;
      return discountPerUnitTRY(q);
    };

    const effectiveUnitPriceOf = (productId: string) => {
      const base = unitPriceOf(productId);
      const it = findItem(productId);
      const q = it?.qty ?? CART_MIN_QTY;
      return effectiveUnitPriceTRY(base, q);
    };

    const lineTotalOf = (productId: string) => {
      const it = findItem(productId);
      if (!it) return 0;
      const base = unitPriceOf(productId);
      return effectiveUnitPriceTRY(base, it.qty) * it.qty;
    };

    const cartTotal = items.reduce((sum, it) => {
      const base = it.product?.wholesalePrice ?? FALLBACK_UNIT_PRICE;
      return sum + effectiveUnitPriceTRY(base, it.qty) * it.qty;
    }, 0);

    const setQty = (productId: string, qty: number) => {
      setItems((prev) => prev.map((x) => {
        if (x.id === productId) {
          const min = (x.product as any)?.minQty ?? CART_MIN_QTY;
          return { ...x, qty: dynamicClamp(qty, min) };
        }
        return x;
      }));
    };

    const inc = (productId: string, step = CART_STEP) => {
      setItems((prev) => prev.map((x) => {
        if (x.id !== productId) return x;
        const min = (x.product as any)?.minQty ?? CART_MIN_QTY;
        return { ...x, qty: dynamicClamp((x.qty || min) + step, min) };
      }));
    };

    const dec = (productId: string, step = CART_STEP) => {
      setItems((prev) => prev.map((x) => {
        if (x.id !== productId) return x;
        const min = (x.product as any)?.minQty ?? CART_MIN_QTY;
        return { ...x, qty: dynamicClamp((x.qty || min) - step, min) };
      }));
    };

    const addItem = (payload: AddPayload) => {
      const minQtyRule = payload.minQty ?? CART_MIN_QTY;
      const incomingQty = dynamicClamp(payload.qty ?? minQtyRule, minQtyRule);
      const incomingBasePrice = typeof payload.price === "number" ? payload.price : FALLBACK_UNIT_PRICE;

      setItems((prev) => {
        const idx = prev.findIndex((x) => x.id === payload.id);
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

        return [...prev, { id: payload.id, product, qty: incomingQty }];
      });
    };

    const remove = (productId: string) => setItems((prev) => prev.filter((x) => x.id !== productId));
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