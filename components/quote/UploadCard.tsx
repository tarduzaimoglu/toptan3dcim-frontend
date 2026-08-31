"use client";

import { useCallback, useRef, useState } from "react";
import { FileBox, UploadCloud, X } from "lucide-react";
import { MAX_FILE_BYTES, MAX_FILE_MB } from "@/lib/quote/constants";

type Props = {
  fileName: string | null;
  onFileAccepted: (file: File) => void;
  onClear: () => void;
  setErrorCode: (code: string | null) => void;
  onPickStart: () => void;
  onPickEnd: () => void;
};

export default function UploadCard({ fileName, onFileAccepted, onClear, setErrorCode, onPickStart, onPickEnd }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    const lowerName = file.name.toLowerCase();
    const error = !lowerName.endsWith(".stl")
      ? "UNSUPPORTED_FORMAT"
      : file.size > MAX_FILE_BYTES
        ? "FILE_TOO_LARGE"
        : null;
    setErrorCode(error);
    if (!error) onFileAccepted(file);
  }, [onFileAccepted, setErrorCode]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">STL dosyanızı yükleyin</h2>
          <p className="mt-1 text-sm text-slate-500">Yalnızca .STL · Maksimum {MAX_FILE_MB} MB</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED]">
          <FileBox size={21} />
        </span>
      </div>

      <div
        className={`flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition ${isDragging ? "border-[#7C3AED] bg-[#7C3AED]/5" : "border-slate-200 bg-slate-50 hover:border-[#7C3AED]/50"}`}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
      >
        <UploadCloud className="mb-4 text-[#7C3AED]" size={45} strokeWidth={1.8} />
        <p className="font-bold text-slate-900">Dosyanızı buraya sürükleyin</p>
        <p className="mt-1 text-sm text-slate-500">veya cihazınızdan seçin</p>
        <button
          type="button"
          className="mt-6 rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#7C3AED]/20 transition hover:-translate-y-0.5 hover:bg-[#6b1add]"
          onPointerDown={onPickStart}
          onClick={() => inputRef.current?.click()}
        >
          Dosya Seç
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".stl,model/stl,application/sla"
          className="hidden"
          onClick={(event) => { event.currentTarget.value = ""; }}
          onChange={(event) => {
            onPickEnd();
            const file = event.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {fileName && (
          <div className="mt-6 flex w-full items-center justify-between gap-3 rounded-xl border border-[#7C3AED]/20 bg-white px-4 py-3 text-left">
            <span className="truncate text-sm font-semibold text-slate-700">{fileName}</span>
            <button type="button" aria-label="Dosyayı kaldır" className="rounded-lg p-2 text-red-500 hover:bg-red-50" onClick={onClear}>
              <X size={17} />
            </button>
          </div>
        )}
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Dosyanız sunucuya yüklenmez; analiz bu tarayıcıda, cihazınızda gerçekleşir.</p>
    </section>
  );
}
