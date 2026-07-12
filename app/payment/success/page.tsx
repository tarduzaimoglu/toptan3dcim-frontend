"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

const CART_STORAGE_KEY = "kesiolabs_cart_v1";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  useEffect(() => {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new StorageEvent("storage", { key: CART_STORAGE_KEY, newValue: null }));
  }, []);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 bg-white text-slate-900 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <CheckCircle2 className="h-9 w-9 text-emerald-600" />
      </div>

      <h1 className="mt-6 text-3xl font-semibold">Siparişiniz Alındı!</h1>
      <p className="mt-3 text-slate-700">
        Ödemeniz başarıyla tamamlandı. Bizi tercih ettiğiniz için teşekkür ederiz.
      </p>

      {orderNumber && (
        <div className="mt-6 inline-block rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4">
          <div className="text-sm text-slate-600">Sipariş Numarası</div>
          <div className="mt-1 text-xl font-bold tracking-wide">{orderNumber}</div>
        </div>
      )}

      <p className="mt-6 text-sm text-slate-600">
        Sipariş onayı ve üretim/teslimat süreciyle ilgili bilgilendirme, kayıtlı e-posta adresinize
        gönderilecektir. Sorularınız için WhatsApp veya e-posta üzerinden bize ulaşabilirsiniz.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/"
          className="h-12 w-full sm:w-auto px-8 inline-flex items-center justify-center rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors duration-300"
        >
          Anasayfaya Dön
        </Link>
        <Link
          href="/products"
          className="h-12 w-full sm:w-auto px-8 inline-flex items-center justify-center rounded-xl border border-slate-300 font-semibold hover:bg-slate-50 transition-colors duration-300"
        >
          Ürünlere Göz At
        </Link>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
