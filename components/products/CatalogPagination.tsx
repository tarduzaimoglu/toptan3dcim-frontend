"use client";

import { useMemo } from "react";

const ORANGE = "#F36B21"; // KesioLabs turuncusu (istersen kendi hex'inle değiştir)

function getWindow(page: number, pageCount: number) {
  // < 2 3 4 > görünümü için: aktif sayfanın etrafında 1-1 göster
  const win = 1;
  const start = Math.max(1, page - win);
  const end = Math.min(pageCount, page + win);
  const nums: number[] = [];
  for (let i = start; i <= end; i++) nums.push(i);
  return nums;
}

export default function CatalogPagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  const pages = useMemo(() => getWindow(page, pageCount), [page, pageCount]);

  if (pageCount <= 1) return null;

  const btnBase =
    "h-9 min-w-9 px-3 rounded-md text-sm transition-colors select-none";

  const inactive =
    "text-neutral-500 hover:text-[color:var(--kesiolabs-orange)] hover:bg-orange-500/10";

  const active =
    "font-semibold text-[color:var(--kesiolabs-orange)] bg-orange-500/10";

  const arrow =
    "text-neutral-500 hover:text-[color:var(--kesiolabs-orange)] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-neutral-500";

  return (
    <div
      className="flex items-center gap-2"
      style={{ ["--kesiolabs-orange" as any]: ORANGE }}
      aria-label="Sayfalama"
    >
      <button
        type="button"
        className={`${btnBase} ${arrow}`}
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Önceki sayfa"
      >
        &lt;
      </button>

      {pages.map((p) => {
        const isActive = p === page;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`${btnBase} ${isActive ? active : inactive}`}
            aria-current={isActive ? "page" : undefined}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        className={`${btnBase} ${arrow}`}
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        aria-label="Sonraki sayfa"
      >
        &gt;
      </button>
    </div>
  );
}
