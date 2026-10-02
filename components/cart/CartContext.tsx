"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import { accountRequest } from '@/lib/account-client';
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
  revision: number;
  accountCart: boolean;
  warnings: string[];
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

function normalizeStoredItems(input: unknown): CartItem[] {
  if (!Array.isArray(input)) return [];
  const normalized: CartItem[] = [];

  for (const value of input) {
    if (!value || typeof value !== "object") continue;
    const it = value as Partial<StoredCartItem>;
    const p = it.product && typeof it.product === "object" ? it.product : {} as Partial<StoredCartItem['product']>;
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
    } as Product;

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
      title: it.product?.title ?? "",
      imageUrl: it.product?.imageUrl,
      wholesalePrice: it.product?.wholesalePrice,
      minQty: it.product?.minQty,
    },
  }));
}
const inputs = (rows: CartItem[]) => rows.map(r => ({ productId: r.productId, qty: r.qty, variant: r.variant || null, price: r.product.wholesalePrice }));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [accountCart, setAccountCart] = useState(false);
  const [revision, setRevision] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const state = useRef({ items, revision, accountCart, generation: 0 });
  const queue = useRef(Promise.resolve());
  const accept = useCallback((result: { cart: { lines: CartItem[]; revision: number; warnings: string[] } }) => {
    const rows = result.cart.lines.map((r: CartItem & { invalid?: boolean; problem?: string }) => ({ ...r, id: r.id || `${r.productId}:${r.variant?.colorName || ''}`, product: r.product || { id: r.productId, title: r.problem || 'Geçersiz ürün' } as Product }));
    state.current.items = rows; state.current.revision = result.cart.revision;
    setItems(rows); setRevision(result.cart.revision); setWarnings(result.cart.warnings);
  }, []);
  const changeItems = useCallback((update: (rows: CartItem[]) => CartItem[]) => {
    if (!state.current.accountCart) { setItems(update); return; }
    const generation = state.current.generation;
    queue.current = queue.current.then(async () => {
      if (generation !== state.current.generation) return;
      try {
        const result = await accountRequest('cart-save', { items: inputs(update(state.current.items)), revision: state.current.revision });
        if (generation === state.current.generation) accept(result);
      } catch (e) {
        if (generation !== state.current.generation) return;
        const message = e instanceof Error ? e.message : 'Sepet güncellenemedi.';
        try { accept(await accountRequest('cart')); } catch {}
        setWarnings(prev => [...prev, message]);
      }
    });
  }, [accept]);

  useEffect(() => {
    async function sync() {
      const generation = ++state.current.generation;
      setHydrated(false); setItems([]); state.current.items = []; setWarnings([]);
      const saved = safeJsonParse<{ items?: CartItem[]; mergeId?: string }>(localStorage.getItem(STORAGE_KEY));
      const guest = normalizeStoredItems(Array.isArray(saved) ? saved : saved?.items || []);
      try {
        const response = await fetch('/api/account/me', { cache: 'no-store' });
        if (generation !== state.current.generation) return;
        if (response.ok) {
          setAccountCart(true); state.current.accountCart = true;
          let result = await accountRequest('cart');
          if (guest.length) {
            const mergeId = saved?.mergeId || crypto.randomUUID();
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: toStored(guest), mergeId }));
            try { result = await accountRequest('cart-merge', { items: inputs(guest), mergeId }); localStorage.removeItem(STORAGE_KEY); }
            catch (e) { result.cart.warnings.push(e instanceof Error ? e.message : 'Misafir sepeti birleştirilemedi.'); }
          }
          if (generation === state.current.generation) accept(result);
        } else if (response.status === 401 || response.status === 503 && process.env.NEXT_PUBLIC_CUSTOMER_ACCOUNTS_ENABLED !== 'true') {
          setAccountCart(false); state.current.accountCart = false; setItems(guest);
        } else { setWarnings(['Hesap sepetine erişilemiyor. Sayfayı yenileyin.']); }
      } catch { setWarnings(['Sepet hizmetine erişilemiyor. Sayfayı yenileyin.']); }
      if (generation === state.current.generation) setHydrated(true);
    }
    void sync();
    const cartState = state.current;
    const changed = () => { sessionStorage.removeItem('checkout-request'); void sync(); };
    const focus = () => { if (state.current.accountCart) queue.current = queue.current.then(async () => { try { accept(await accountRequest('cart')); } catch {} }); };
    window.addEventListener('customer-session-changed', changed); window.addEventListener('focus', focus);
    return () => { cartState.generation++; window.removeEventListener('customer-session-changed', changed); window.removeEventListener('focus', focus); };
  }, [accept]);

  useEffect(() => {
    if (!hydrated || accountCart) return;
    const previous = safeJsonParse<{ settledOrders?: string[] }>(localStorage.getItem(STORAGE_KEY));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: toStored(items), settledOrders: previous?.settledOrders || [] }));
  }, [items, hydrated, accountCart]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (state.current.accountCart) return;
      if (e.key !== STORAGE_KEY) return;
      const saved = safeJsonParse<{ items?: StoredCartItem[] }>(e.newValue);
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
      changeItems((prev) => prev.map((x) => {
        if (x.id === rowId) {
          const min = x.product?.minQty ?? CART_MIN_QTY;
          return { ...x, qty: dynamicClamp(qty, min) };
        }
        return x;
      }));
    };

    const inc = (rowId: string, step = CART_STEP) => {
      changeItems((prev) => prev.map((x) => {
        if (x.id !== rowId) return x;
        const min = x.product?.minQty ?? CART_MIN_QTY;
        return { ...x, qty: dynamicClamp((x.qty || min) + step, min) };
      }));
    };

    const dec = (rowId: string, step = CART_STEP) => {
      changeItems((prev) => prev.map((x) => {
        if (x.id !== rowId) return x;
        const min = x.product?.minQty ?? CART_MIN_QTY;
        return { ...x, qty: dynamicClamp((x.qty || min) - step, min) };
      }));
    };

    const addItem = (payload: AddPayload) => {
      if (state.current.accountCart) {
        const generation = state.current.generation;
        queue.current = queue.current.then(async () => {
          if (generation !== state.current.generation) return;
          try { const result = await accountRequest('cart-merge', { mergeId: crypto.randomUUID(), items: [{ productId: payload.id, qty: payload.qty || payload.minQty || 1, variant: payload.variant || null }] }); if (generation === state.current.generation) accept(result); }
          catch (e) { if (generation === state.current.generation) setWarnings([e instanceof Error ? e.message : 'Ürün eklenemedi.']); }
        }); return;
      }
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
          const min = existing.product?.minQty ?? CART_MIN_QTY;
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
        } as Product;

        return [...prev, { id: rowId, productId: payload.id, variant, product, qty: incomingQty }];
      });
    };

    const remove = (rowId: string) => changeItems((prev) => prev.filter((x) => x.id !== rowId));
    const clear = () => changeItems(() => []);

    return {
      items, itemCount, qtyCount, hydrated, revision, accountCart, warnings,
      unitPriceOf, discountPerUnitOf, effectiveUnitPriceOf, lineTotalOf, cartTotal,
      addItem, setQty, inc, dec, remove, clear,
    };
  }, [items, hydrated, revision, accountCart, warnings, changeItems, accept]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
