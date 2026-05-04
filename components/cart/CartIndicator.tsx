"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";

/** ✅ Named export: <CartIndicator /> şeklinde de kullanılabilsin */
export function CartIndicator() {
  const { itemCount, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100"
      aria-label="Sepet"
    >
      <ShoppingBag className="h-5 w-5 text-slate-800" />

      {/* ✅ Hydrated olmadan badge gösterme (flicker önleme) */}
      {hydrated && itemCount > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-semibold text-white">
          {itemCount}
        </span>
      ) : null}
    </Link>
  );
}

/** ✅ Default export: import CartIndicator from ... kullanan yerler bozulmasın */
export default CartIndicator;

/** ✅ Mobil baloncuk */
export function CartFab() {
  const { itemCount, hydrated } = useCart();

  // ✅ Hydrated olmadan karar verme (ilk anda yanlışlıkla gizlenmesin/gösterilmesin)
  if (!hydrated) return null;
  if (itemCount <= 0) return null;

  return (
    <Link
      href="/cart"
      aria-label="Sepete git"
      className={[
        "fixed left-5 bottom-5 z-50",
        "h-14 w-14 rounded-full",
        "bg-slate-900 text-white shadow-lg",
        "flex items-center justify-center",
        "hover:opacity-95",
      ].join(" ")}
    >
      <div className="relative">
        <ShoppingBag className="h-6 w-6" />
        <span className="absolute -right-3 -top-3 flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1 text-[12px] font-semibold text-white">
          {itemCount}
        </span>
      </div>
    </Link>
  );
}
