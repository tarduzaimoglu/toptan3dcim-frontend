"use client";

import React from "react";

export function ProductCardSkeleton() {
  return (
    <div className="group w-full flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse">
      {/* Görsel Alanı İskeleti (3:4 Oranında) */}
      <div className="relative aspect-[3/4] w-full bg-slate-200" />

      {/* Metin Alanı İskeleti */}
      <div className="p-4 space-y-3">
        {/* Başlık İskeleti (2 satır) */}
        <div className="space-y-2">
          <div className="h-4 w-5/6 rounded-md bg-slate-200" />
          <div className="h-4 w-2/3 rounded-md bg-slate-200" />
        </div>

        {/* Fiyat ve Adet İskeleti */}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="h-5 w-20 rounded-md bg-slate-200" />
          <div className="h-3 w-12 rounded-md bg-slate-200" />
        </div>

        {/* Detay Butonu İskeleti */}
        <div className="mt-3 h-3 w-24 rounded-md bg-slate-100" />
      </div>
    </div>
  );
}