"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Calculator, CheckCircle2, Package, Settings2 } from "lucide-react";
import UploadCard from "./UploadCard";
import { UPLOAD_ERRORS } from "./errors";
import { MATERIALS, MIN_TOTAL_TRY, type MaterialKey } from "@/lib/quote/constants";
import { calcPricing, type Metrics } from "@/lib/quote/pricing";
import { buildQuoteWhatsAppUrl } from "@/lib/quote/whatsapp";

const StlScene = dynamic(() => import("./stl/StlScene"), { ssr: false });
const COLORS = ["#111111", "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#7C3AED", "#ec4899", "#94a3b8"];

export default function TeklifAlClient() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [material, setMaterial] = useState<MaterialKey>("PLA");
  const [colorHex, setColorHex] = useState("#111111");
  const [infillPct, setInfillPct] = useState(20);
  const [qty, setQty] = useState(1);
  const [isPickingFile, setIsPickingFile] = useState(false);

  const clearFile = useCallback(() => {
    setFileUrl((current) => { if (current) URL.revokeObjectURL(current); return null; });
    setFileName(null);
    setMetrics(null);
    setErrorCode(null);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") setIsPickingFile(false);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, []);

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  const pricing = useMemo(() => calcPricing({ metrics, material, colorHex, infillPct, qty }), [metrics, material, colorHex, infillPct, qty]);
  const whatsappUrl = useMemo(() => buildQuoteWhatsAppUrl([
    `Dosya: ${fileName ?? "Seçilmedi"}`,
    `Malzeme: ${material}`,
    `Renk: ${colorHex}`,
    `Doluluk: %${infillPct}`,
    `Adet: ${qty}`,
    `Tahmini ağırlık: ${pricing.weightG ? `${pricing.weightG.toFixed(1)} g` : "Hesaplanmadı"}`,
    `Tahmini toplam: ${pricing.finalTotalTRY ? `₺${pricing.finalTotalTRY.toFixed(2)}` : "Hesaplanmadı"}`,
  ].join("\n")), [fileName, material, colorHex, infillPct, qty, pricing]);

  const error = errorCode ? (UPLOAD_ERRORS[errorCode] ?? UPLOAD_ERRORS.UNKNOWN) : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <span className="inline-flex rounded-full bg-[#FF7A00]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#e66e00]">3D baskı teklif aracı</span>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">Modelinizi yükleyin, <span className="text-[#7C3AED]">tahmini fiyatınızı görün.</span></h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">STL dosyanızı cihazınızda güvenle analiz edin; malzeme, renk, doluluk ve adet seçeneklerini belirleyerek üretim talebinizi hazırlayın.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-14">
        <div className="space-y-7 lg:col-span-5">
          <UploadCard
            fileName={fileName}
            setErrorCode={setErrorCode}
            onPickStart={() => setIsPickingFile(true)}
            onPickEnd={() => setIsPickingFile(false)}
            onClear={clearFile}
            onFileAccepted={(file) => {
              clearFile();
              setFileUrl(URL.createObjectURL(file));
              setFileName(file.name);
            }}
          />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3"><Settings2 className="text-[#7C3AED]" /><h2 className="text-xl font-black text-slate-900">Üretim detayları</h2></div>
            <div className="space-y-6">
              <label className="block text-sm font-bold text-slate-700">Malzeme
                <select value={material} onChange={(event) => setMaterial(event.target.value as MaterialKey)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/15">
                  {Object.keys(MATERIALS).map((key) => <option key={key}>{key}</option>)}
                </select>
              </label>

              <fieldset><legend className="text-sm font-bold text-slate-700">Renk</legend><div className="mt-3 flex flex-wrap gap-3">
                {COLORS.map((color) => <button key={color} type="button" aria-label={`Renk ${color}`} aria-pressed={color === colorHex} onClick={() => setColorHex(color)} className={`h-9 w-9 rounded-full border border-slate-300 shadow-sm transition hover:scale-110 ${color === colorHex ? "ring-2 ring-[#7C3AED] ring-offset-2" : ""}`} style={{ backgroundColor: color }} />)}
              </div></fieldset>

              <label className="block text-sm font-bold text-slate-700"><span className="flex justify-between"><span>İç doluluk</span><span className="text-[#7C3AED]">%{infillPct}</span></span>
                <input type="range" min={10} max={50} step={5} value={infillPct} onChange={(event) => setInfillPct(Number(event.target.value))} className="mt-3 w-full accent-[#7C3AED]" />
              </label>

              <div><span className="text-sm font-bold text-slate-700">Adet</span><div className="mt-2 flex items-center gap-3">
                <button type="button" aria-label="Adedi azalt" onClick={() => setQty((value) => Math.max(1, value - 1))} className="h-11 w-11 rounded-xl border border-slate-200 bg-slate-50 text-xl font-bold text-slate-700 hover:border-[#7C3AED]">−</button>
                <input aria-label="Adet" type="number" min={1} value={qty} onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))} className="h-11 w-24 rounded-xl border border-slate-200 text-center font-bold outline-none focus:border-[#7C3AED]" />
                <button type="button" aria-label="Adedi artır" onClick={() => setQty((value) => value + 1)} className="h-11 w-11 rounded-xl border border-slate-200 bg-slate-50 text-xl font-bold text-slate-700 hover:border-[#7C3AED]">+</button>
              </div></div>
            </div>
          </section>
        </div>

        <div className="space-y-7 lg:col-span-7">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-5"><h2 className="text-xl font-black text-slate-900">3D model önizleme</h2><p className="mt-1 text-sm text-slate-500">Modeli döndürmek için sürükleyin, yakınlaştırmak için kaydırın.</p></div>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 md:aspect-video lg:aspect-[4/3]">
              {isPickingFile ? <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">Dosya seçiliyor…</div> : fileUrl ? <StlScene fileUrl={fileUrl} colorHex={colorHex} onMetrics={(value) => { setMetrics(value); setErrorCode(null); }} onError={setErrorCode} /> : <div className="flex h-full flex-col items-center justify-center px-6 text-center text-slate-400"><Package size={50} strokeWidth={1.5} /><p className="mt-3 text-sm font-semibold">STL yüklediğinizde modeliniz burada görünecek.</p></div>}
            </div>
            {error && <div role="alert" className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"><AlertCircle className="shrink-0" size={20} /><div><p className="font-bold">{error.title}</p><p className="mt-1 text-sm">{error.message}</p></div></div>}
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6 md:p-8"><div className="mb-6 flex items-center gap-3"><Calculator className="text-[#FF7A00]" /><h2 className="text-xl font-black text-slate-900">Tahmini üretim bedeli</h2></div>
              <div className="rounded-2xl bg-[#7C3AED] p-6 text-white shadow-xl shadow-[#7C3AED]/20"><p className="text-sm font-bold text-purple-100">Toplam tahmini fiyat</p><p className="mt-1 text-4xl font-black">₺{pricing.finalTotalTRY.toFixed(2)}</p>{pricing.minimumApplied && <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Minimum üretim bedeli: ₺{MIN_TOTAL_TRY.toFixed(2)}</span>}</div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tahmini ağırlık</p><p className="mt-2 text-xl font-black text-slate-900">{pricing.weightG ? `${pricing.weightG.toFixed(1)} g` : "—"}</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Ayarlar</p><p className="mt-2 font-bold text-slate-900">{material} · %{infillPct} · {qty} adet</p></div></div>
              <p className="mt-5 flex gap-2 text-sm leading-6 text-slate-500"><AlertCircle className="mt-0.5 shrink-0" size={17} />Bu tutar ön bilgilendirme amaçlıdır. Model ve üretim koşulları incelendikten sonra netleşir.</p>
            </div>
            <div className="border-t border-slate-200 bg-slate-50 p-6 md:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-500" size={21} /><p className="max-w-md text-sm leading-6 text-slate-600">Dosyanızı WhatsApp&apos;a otomatik eklemeyiz. Talebi ilettikten sonra STL dosyanızı temsilcimizle güvenli biçimde paylaşabilirsiniz.</p></div><a aria-disabled={!metrics} href={metrics ? whatsappUrl : undefined} target="_blank" rel="noopener noreferrer" className={`inline-flex shrink-0 items-center justify-center rounded-xl px-6 py-4 text-sm font-black text-white transition ${metrics ? "bg-[#25D366] shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 hover:bg-[#20b958]" : "cursor-not-allowed bg-slate-300"}`}>WhatsApp ile teklifi netleştir</a></div>{!metrics && <p className="mt-3 text-right text-xs font-semibold text-[#e66e00]">Devam etmek için geçerli bir STL dosyası yükleyin.</p>}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
