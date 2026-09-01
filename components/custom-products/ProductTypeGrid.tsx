"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import type { CustomProductType } from "@/lib/custom-products/constants";

export default function ProductTypeGrid({ types, selectedIds, onToggle }: { types: CustomProductType[]; selectedIds: string[]; onToggle: (id: string) => void }) {
  const selected = new Set(selectedIds);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {types.map((type) => {
        const active = selected.has(type.id);
        return (
          <button key={type.id} type="button" aria-pressed={active} onClick={() => onToggle(type.id)} className={`group relative overflow-hidden rounded-3xl border p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${active ? "border-[#7C3AED] bg-[#7C3AED] text-white shadow-[#7C3AED]/20" : "border-slate-200 bg-white text-slate-900 hover:border-[#7C3AED]/40"}`}>
            <div className={`relative mb-5 aspect-[4/3] overflow-hidden rounded-2xl ${active ? "bg-white/10" : "bg-slate-50"}`}>
              <Image src={type.image} alt={type.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-3 transition duration-300 group-hover:scale-105" />
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className={`text-xs font-black uppercase tracking-widest ${active ? "text-purple-100" : "text-[#FF7A00]"}`}>Özel üretim</span>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${active ? "border-white/30 bg-white text-[#7C3AED]" : "border-slate-200 text-transparent"}`}><Check size={17} strokeWidth={3} /></span>
            </div>
            <h3 className="mt-5 text-lg font-black">{type.title}</h3>
            <p className={`mt-2 text-sm leading-6 ${active ? "text-purple-100" : "text-slate-500"}`}>Logonuz ve kurumsal ihtiyaçlarınız doğrultusunda size özel tasarlanır.</p>
            <div className={`mt-5 text-xs font-black uppercase tracking-widest ${active ? "text-white" : "text-[#FF7A00]"}`}>{active ? "Seçildi" : "Seç"}</div>
          </button>
        );
      })}
    </div>
  );
}
