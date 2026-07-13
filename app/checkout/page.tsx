"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { vatInclusiveAmount, shippingFeeFor } from "@/lib/pricing";

const formatTry = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(n);

const inputClass =
  "w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#7C3AED] outline-none transition-all";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, hydrated, lineTotalOf, cartTotal } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [contractAccepted, setContractAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  if (!hydrated || items.length === 0) {
    return <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-white text-slate-900" />;
  }

  const subtotal = cartTotal;
  const vatInfo = vatInclusiveAmount(subtotal);
  const shippingFee = shippingFeeFor(subtotal);
  const grandTotal = subtotal + shippingFee;

  const formValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    city.trim().length > 0 &&
    district.trim().length > 0 &&
    address.trim().length > 0;

  const canSubmit = formValid && contractAccepted && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      let res: Response;
      try {
        res = await fetch(`${backendUrl}/api/payment/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((it) => ({ productId: it.productId, qty: it.qty, variant: it.variant ?? null })),
            buyer: {
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              address: { city: city.trim(), district: district.trim(), addressLine: address.trim() },
            },
            contractAccepted: true,
          }),
        });
      } catch {
        throw new Error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
      }

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const message = json?.error?.message || "Ödeme başlatılamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.";
        throw new Error(message);
      }

      const oosUrl = json?.oosUrl;
      const formFields = json?.formFields;

      if (!oosUrl || !formFields) {
        throw new Error("Banka yanıtı eksik. Lütfen tekrar deneyin.");
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = oosUrl;
      form.style.display = "none";

      Object.entries(formFields as Record<string, string>).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 bg-white text-slate-900">
      <h1 className="text-4xl font-semibold">Ödeme</h1>
      <p className="mt-2 text-slate-700">Siparişinizi tamamlamak için alıcı bilgilerinizi girin.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Alıcı Bilgileri</h2>

          <div className="grid md:grid-cols-2 gap-5">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ad Soyad"
              className={inputClass}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="E-posta"
              className={inputClass}
            />
          </div>

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            required
            placeholder="Telefon"
            className={inputClass}
          />

          <div className="grid md:grid-cols-2 gap-5">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder="İl"
              className={inputClass}
            />
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              placeholder="İlçe"
              className={inputClass}
            />
          </div>

          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            placeholder="Açık Adres"
            rows={3}
            className={`${inputClass} resize-y`}
          />

          <label className="flex items-start gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={contractAccepted}
              onChange={(e) => setContractAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED]"
            />
            <span>
              <Link
                href="/distance-selling"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#7C3AED] hover:underline"
              >
                Mesafeli Satış Sözleşmesi'ni ve Ön Bilgilendirme Koşullarını
              </Link>{" "}
              okudum, kabul ediyorum.
            </span>
          </label>

          {errorMsg && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 font-medium border border-red-100">
              <AlertCircle size={20} className="text-red-500 shrink-0" />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="h-12 w-full rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#7C3AED]"
          >
            {submitting ? "Yönlendiriliyor..." : "Ödemeye Geç"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24 h-fit">
          <div className="text-[18px] font-semibold">Sipariş Özeti</div>
          <div className="mt-5 space-y-3 text-[13px] max-h-72 overflow-y-auto">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between gap-2">
                <span className="text-slate-700">
                  {it.product?.title ?? "Ürün"} × {it.qty}
                </span>
                <span className="font-semibold whitespace-nowrap">{formatTry(lineTotalOf(it.id))}</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-slate-200 my-4" />
          <div className="space-y-3 text-[14px]">
            <div className="flex justify-between"><span>Ara toplam</span><span>{formatTry(subtotal)}</span></div>
            <div className="flex justify-between text-slate-500 text-[13px]"><span>KDV (fiyatlara dahildir)</span><span>{formatTry(vatInfo)}</span></div>
            <div className="flex justify-between"><span>Kargo</span><span className={shippingFee === 0 ? "text-emerald-700 font-bold" : ""}>{shippingFee === 0 ? "Ücretsiz" : formatTry(shippingFee)}</span></div>
            <div className="h-px bg-slate-200 my-2" />
            <div className="flex justify-between font-bold text-lg"><span>Genel toplam</span><span>{formatTry(grandTotal)}</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
