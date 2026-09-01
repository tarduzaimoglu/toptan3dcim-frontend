"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import type { CustomProductType } from "@/lib/custom-products/constants";

export default function QuoteForm({ selectedTypes, logoFile }: { selectedTypes: CustomProductType[]; logoFile: File | null }) {
  const [accepted, setAccepted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const selectedText = useMemo(() => selectedTypes.map((type) => type.title).join(", "), [selectedTypes]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("idle");
    setMessage("");
    if (!selectedTypes.length) { setStatus("error"); setMessage("En az bir ürün türü seçin."); return; }
    if (!accepted) { setStatus("error"); setMessage("Devam etmek için veri işleme onayı gereklidir."); return; }

    setIsSending(true);
    try {
      const formData = new FormData(form);
      formData.set("selectedTypes", selectedText);
      formData.set("accepted", "true");
      if (logoFile) formData.set("logo", logoFile);
      const response = await fetch("/api/custom-products/quote", { method: "POST", body: formData });
      const result: { ok?: boolean; message?: string } = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || "Talep gönderilemedi.");
      setStatus("success");
      form.reset();
      setAccepted(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Talep gönderilemedi.");
    } finally {
      setIsSending(false);
    }
  }

  if (status === "success") {
    return <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center md:p-10"><CheckCircle2 className="mx-auto text-emerald-500" size={50} /><h3 className="mt-4 text-2xl font-black text-slate-900">Talebiniz alındı</h3><p className="mt-2 text-slate-600">Üretim ekibimiz verdiğiniz iletişim bilgileri üzerinden sizinle iletişime geçecek.</p></div>;
  }

  const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15";
  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
      <div className="mb-8"><span className="text-xs font-black uppercase tracking-widest text-[#FF7A00]">Son adım</span><h2 className="mt-2 text-2xl font-black text-slate-900">Teklif bilgilerinizi paylaşın</h2><p className="mt-2 text-sm leading-6 text-slate-500">Seçimleriniz ve varsa logo dosyanız yalnızca bu teklif talebini değerlendirmek için kullanılır.</p></div>
      <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${selectedTypes.length ? "border-[#7C3AED]/20 bg-[#7C3AED]/5 font-semibold text-[#7C3AED]" : "border-orange-200 bg-orange-50 text-orange-700"}`}>{selectedText || "Henüz ürün türü seçilmedi."}</div>
      <input name="website" type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">Adınız Soyadınız<input name="name" required maxLength={100} autoComplete="name" className={inputClass} placeholder="Adınız Soyadınız" /></label>
        <label className="text-sm font-bold text-slate-700">Firma Adı<input name="company" required maxLength={120} autoComplete="organization" className={inputClass} placeholder="Firma adı" /></label>
        <label className="text-sm font-bold text-slate-700">Telefon<input name="phone" type="tel" required minLength={7} maxLength={30} autoComplete="tel" className={inputClass} placeholder="05XX XXX XX XX" /></label>
        <label className="text-sm font-bold text-slate-700">E-posta<input name="email" type="email" required maxLength={160} autoComplete="email" className={inputClass} placeholder="ornek@firma.com" /></label>
      </div>
      <label className="mt-5 block text-sm font-bold text-slate-700">Ek notlar <span className="font-normal text-slate-400">(opsiyonel)</span><textarea name="note" maxLength={2000} rows={5} className={`${inputClass} resize-y`} placeholder="Adet, teslim tarihi veya özel üretim beklentilerinizi yazabilirsiniz." /></label>
      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-600"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-5 w-5 rounded accent-[#7C3AED]" /><span>Paylaştığım bilgilerin fiyat teklifi oluşturulması amacıyla Gizlilik Politikası kapsamında işlenmesini kabul ediyorum.</span></label>
      {status === "error" && <div role="alert" className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="shrink-0" size={19} />{message}</div>}
      <button type="submit" disabled={isSending || !selectedTypes.length || !accepted} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-8 py-4 text-sm font-black text-white shadow-lg shadow-[#7C3AED]/20 transition hover:-translate-y-0.5 hover:bg-[#6b1add] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none md:w-auto"><Send size={18} />{isSending ? "Gönderiliyor…" : "Teklif isteyin"}</button>
    </form>
  );
}
