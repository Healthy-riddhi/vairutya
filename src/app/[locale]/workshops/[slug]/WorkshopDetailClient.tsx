"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Clock, Tag, UtensilsCrossed, Circle, CheckCircle2 } from "lucide-react";
import type { WorkshopFull } from "@/types/content";

export function WorkshopDetailClient({ workshop }: { workshop: WorkshopFull }) {
  const t = useTranslations("Workshops");
  const [selectedDate, setSelectedDate] = useState("");
  const [booked, setBooked] = useState(false);

  if (booked) {
    const chosen = workshop.dates.find((d) => d.value === selectedDate);
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <CheckCircle2 size={56} strokeWidth={1.75} className="mb-4 text-teal" />
        <h2 className="mb-2.5 font-serif text-3xl font-medium text-ink">
          {t("booked")}
        </h2>
        <p className="mb-2 text-[15px] text-ink-muted">{workshop.title}</p>
        <p className="font-display text-[15px] font-bold text-teal">
          {chosen?.label}
        </p>
        <Link href="/" className="btn-primary mt-8 !rounded-full">
          {t("back")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[320px] overflow-hidden sm:h-[380px]">
        <Image
          src={workshop.heroImage}
          alt={workshop.title}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 max-w-[700px] px-6 py-8 text-white sm:px-10">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b6f6c8]">
            {workshop.category}
          </span>
          <h1 className="mb-3 font-serif text-2xl font-medium leading-tight sm:text-4xl">
            {workshop.title}
          </h1>
          <div className="flex flex-wrap gap-5">
            <span className="flex items-center gap-1.5 text-[13px] text-white/85">
              <Clock size={16} strokeWidth={2} /> {workshop.durationLabel}
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-white/85">
              <Tag size={16} strokeWidth={2} /> {workshop.priceLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[860px] flex-col gap-10 px-6 py-12 pb-20">
        {/* About */}
        <div>
          <h2 className="mb-4.5 font-serif text-[28px] font-medium text-teal">
            {t("about")}
          </h2>
          {workshop.about.map((p, i) => (
            <p key={i} className="mb-4 text-[15px] leading-[1.85] text-ink">
              {p}
            </p>
          ))}
        </div>

        {/* Menu */}
        {workshop.menu && (
          <div className="rounded-2xl border border-line/15 bg-white p-7">
            <h2 className="mb-5 flex items-center gap-2.5 font-serif text-2xl font-medium text-teal">
              <UtensilsCrossed size={22} strokeWidth={1.75} /> {t("menu")}
            </h2>
            <div className="flex flex-col gap-3">
              {workshop.menu.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Circle
                    size={8}
                    strokeWidth={0}
                    fill="currentColor"
                    className="mt-2 shrink-0 text-teal"
                  />
                  <p className="text-sm leading-relaxed text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {workshop.notes && (
          <div className="rounded-r-xl border-l-4 border-teal bg-teal/[0.03] px-6 py-5">
            <h3 className="mb-2.5 text-sm font-bold uppercase tracking-[0.06em] text-teal">
              {t("notes")}
            </h3>
            {workshop.notes.map((n, i) => (
              <p key={i} className="mb-2 text-sm leading-relaxed text-ink last:mb-0">
                {n}
              </p>
            ))}
          </div>
        )}

        {/* Booking */}
        <div className="rounded-2xl border border-line/15 bg-white p-8">
          <h2 className="mb-6 font-serif text-2xl font-medium text-teal">
            {t("selectTitle")}
          </h2>
          <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {workshop.dates.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setSelectedDate(d.value)}
                className={`rounded-[10px] border-2 px-4.5 py-3.5 text-left text-sm transition-all ${
                  selectedDate === d.value
                    ? "border-teal bg-teal/10 font-bold text-teal"
                    : "border-line text-ink hover:border-teal/40"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            disabled={!selectedDate}
            onClick={() => selectedDate && setBooked(true)}
            className={`mb-4 w-full rounded-full py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors ${
              selectedDate ? "cursor-pointer bg-teal" : "cursor-not-allowed bg-line"
            }`}
          >
            {t("book", { price: workshop.priceLabel })}
          </button>

          <p className="text-center text-[13px] text-ink-muted">
            {t.rich("private", {
              link: (c) => (
                <Link href="/contact" className="font-semibold text-teal no-underline">
                  {c}
                </Link>
              ),
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
