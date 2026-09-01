"use client";

import { useMemo, useState } from "react";
import { FileImage, RefreshCw, UploadCloud, X } from "lucide-react";
import LogoPreview3D from "./LogoPreview3D";
import ProductTypeGrid from "./ProductTypeGrid";
import QuoteForm from "./QuoteForm";
import { MAX_LOGO_FILE_MB, validateLogoFile, type CustomProductType } from "@/lib/custom-products/constants";

function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

export default function CustomProductsClient({ productTypes }: { productTypes: CustomProductType[] }) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedTypes = useMemo(() => productTypes.filter((type) => selectedIds.includes(type.id)), [productTypes, selectedIds]);

  function acceptFile(file?: File) {
    if (!file) return;
    const error = validateLogoFile(file);
    setFileError(error);
    if (!error) setLogoFile(file);
  }

  function toggleType(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <span className="inline-flex rounded-full bg-[#FF7A00]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#e66e00]">Markanıza özel üretim</span>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-900 md:text-6xl">Firmanıza özel ürünleri <span className="text-[#7C3AED]">birlikte tasarlayalım.</span></h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">Logonuzu yükleyin, ilgilendiğiniz ürün türlerini seçin ve kurumsal ihtiyacınıza uygun teklif talebinizi oluşturun.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <section>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {[['1', 'Logonuzu yükleyin', 'PNG, JPG veya PDF'], ['2', 'Ürünleri seçin', 'Birden fazla seçim'], ['3', 'Teklif isteyin', 'Ekibimiz sizinle iletişime geçsin']].map(([step, title, detail]) => <div key={step} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-black text-white">{step}</span><h2 className="mt-4 font-black text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{detail}</p></div>)}
          </div>

          <div className="grid gap-7 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <h2 className="text-xl font-black text-slate-900">1. Logonuzu yükleyin</h2>
              <p className="mt-2 text-sm text-slate-500">Şeffaf arka planlı PNG en iyi önizleme sonucunu verir.</p>
              <div className={`mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition ${isDragging ? "border-[#7C3AED] bg-[#7C3AED]/5" : "border-slate-200 bg-slate-50 hover:border-[#7C3AED]/50"}`} onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }} onDrop={(event) => { event.preventDefault(); setIsDragging(false); acceptFile(event.dataTransfer.files?.[0]); }}>
                <UploadCloud className="text-[#7C3AED]" size={48} strokeWidth={1.7} />
                <p className="mt-4 font-bold text-slate-900">Dosyanızı buraya sürükleyin</p><p className="mt-1 text-sm text-slate-500">PNG, JPG veya PDF · Maksimum {MAX_LOGO_FILE_MB} MB</p>
                <label className="mt-6 cursor-pointer rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-black text-white shadow-lg shadow-[#7C3AED]/20 transition hover:-translate-y-0.5 hover:bg-[#6b1add]">Cihazdan seç<input type="file" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf" className="hidden" onClick={(event) => { event.currentTarget.value = ""; }} onChange={(event) => acceptFile(event.target.files?.[0])} /></label>
              </div>
              {fileError && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{fileError}</p>}
              {logoFile && <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#7C3AED]/20 bg-[#7C3AED]/5 p-4"><div className="flex min-w-0 items-center gap-3"><FileImage className="shrink-0 text-[#7C3AED]" /><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{logoFile.name}</p><p className="text-xs text-slate-500">{formatBytes(logoFile.size)}</p></div></div><div className="flex gap-2"><label title="Değiştir" className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-white hover:text-[#7C3AED]"><RefreshCw size={17} /><input type="file" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf" className="hidden" onClick={(event) => { event.currentTarget.value = ""; }} onChange={(event) => acceptFile(event.target.files?.[0])} /></label><button type="button" title="Kaldır" aria-label="Logo dosyasını kaldır" onClick={() => { setLogoFile(null); setFileError(null); }} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><X size={17} /></button></div></div>}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><h2 className="text-xl font-black text-slate-900">2. 3D önizleme</h2><p className="mt-2 text-sm text-slate-500">Görsel logonuzun örnek bir ürün yüzeyindeki yerleşimini inceleyin.</p><div className="mt-6 aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:aspect-video lg:aspect-square"><LogoPreview3D file={logoFile} /></div><p className="mt-4 text-xs leading-5 text-slate-500">Önizleme yalnızca fikir vermek içindir; nihai tasarım, teknik inceleme ve onay sonrası hazırlanır.</p></div>
          </div>
        </section>

        <section><div className="mb-8 max-w-3xl"><span className="text-xs font-black uppercase tracking-widest text-[#FF7A00]">3. Ürün seçimi</span><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Hangi ürünleri markanıza uyarlayalım?</h2><p className="mt-3 text-slate-600">Bir veya birden fazla ürün türü seçebilirsiniz.</p></div><ProductTypeGrid types={productTypes} selectedIds={selectedIds} onToggle={toggleType} /></section>
        <section className="mx-auto max-w-4xl"><QuoteForm selectedTypes={selectedTypes} logoFile={logoFile} /></section>
      </div>
    </main>
  );
}
