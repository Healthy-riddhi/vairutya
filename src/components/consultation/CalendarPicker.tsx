"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

const keyOf = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export function CalendarPicker({
  month,
  onMonthChange,
  selected,
  onSelect,
  available,
}: {
  month: Date;
  onMonthChange: (d: Date) => void;
  selected: Date | null;
  onSelect: (d: Date) => void;
  /** Dates that can be booked, as "YYYY-MM-DD". Everything else is greyed out. */
  available: string[];
}) {
  const t = useTranslations("Consultation");
  const locale = useLocale() === "fr" ? "fr-FR" : "en-GB";
  const year = month.getFullYear();
  const mon = month.getMonth();
  const firstDay = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();

  const open = new Set(available);
  const sorted = [...available].sort();
  const here = keyOf(year, mon, 1).slice(0, 7);
  const canPrev = sorted.length > 0 && here > sorted[0].slice(0, 7);
  const canNext = sorted.length > 0 && here < sorted[sorted.length - 1].slice(0, 7);

  // 1 Jan 2023 was a Sunday, so these seven dates give Sun…Sat in any language
  const dayNames = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2023, 0, 1 + i))
  );
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month);

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isSel = (d: number) =>
    selected?.getFullYear() === year && selected?.getMonth() === mon && selected?.getDate() === d;

  return (
    <div className="mb-10 max-w-[380px] rounded-2xl border border-line bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <button type="button" disabled={!canPrev} onClick={() => onMonthChange(new Date(year, mon - 1, 1))} className="p-2.5 text-ink-muted hover:text-teal disabled:opacity-30" aria-label={t("prevMonth")}>
          <ChevronLeft size={20} strokeWidth={2} />
        </button>
        <span className="font-display text-[15px] font-bold capitalize text-ink">{monthLabel}</span>
        <button type="button" disabled={!canNext} onClick={() => onMonthChange(new Date(year, mon + 1, 1))} className="p-2.5 text-ink-muted hover:text-teal disabled:opacity-30" aria-label={t("nextMonth")}>
          <ChevronRight size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7">
        {dayNames.map((d) => (
          <div key={d} className="py-1 text-center text-xs font-semibold capitalize tracking-[0.05em] text-ink-muted">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const ok = open.has(keyOf(year, mon, d));
          const sel = isSel(d);
          return (
            <button
              key={i}
              type="button"
              disabled={!ok}
              onClick={() => ok && onSelect(new Date(year, mon, d))}
              className={`flex aspect-square w-full items-center justify-center rounded-full text-[13px] transition-colors ${
                sel ? "bg-teal font-bold text-white" : !ok ? "cursor-not-allowed text-line" : "font-semibold text-ink hover:bg-teal/10"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
