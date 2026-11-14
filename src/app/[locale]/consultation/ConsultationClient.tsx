"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import { CalendarPicker } from "@/components/consultation/CalendarPicker";
import { StepLabel } from "@/components/consultation/StepLabel";
import type { ConsultationContent } from "@/types/content";
import { parisLabel, slotLabel } from "@/lib/consultation";

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function ConsultationClient({
  content,
  days,
}: {
  content: ConsultationContent | null;
  /** Open slots from Strapi: { "2026-12-04": ["10:00", "11:00"] } */
  days: Record<string, string[]>;
}) {
  const t = useTranslations("Consultation");
  const locale = useLocale();
  const router = useRouter();

  const availableKeys = Object.keys(days).sort();
  const first = availableKeys[0] ? new Date(`${availableKeys[0]}T00:00:00`) : new Date();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calMonth, setCalMonth] = useState(new Date(first.getFullYear(), first.getMonth(), 1));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [concern, setConcern] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bookingRef = useRef<HTMLDivElement>(null);

  const selectedKey = selectedDate ? keyOf(selectedDate) : null;
  const slots = selectedKey ? (days[selectedKey] ?? []) : [];
  const slotValid = selectedSlot !== null && slots.includes(selectedSlot);
  const paris =
    locale === "fr" && selectedKey && selectedSlot && slotValid ? parisLabel(selectedKey, selectedSlot) : null;

  const canBook = Boolean(selectedKey && slotValid && name.trim() && phone.trim() && email.trim());

  async function submitBooking() {
    if (!canBook || sending || !selectedKey || !selectedSlot) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, concern, date: selectedKey, slot: selectedSlot, locale }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (data?.code === "slot_unavailable") {
          router.refresh(); // reload the open slots
          throw new Error(t("taken"));
        }
        throw new Error(data?.error ?? t("generic"));
      }
      router.push(
        `/consultation/confirmed?ref=${encodeURIComponent(data.reference)}&t=${encodeURIComponent(data.token)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generic"));
      setSending(false);
    }
  }

  function scrollToBooking() {
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto max-w-[860px] px-6 py-10 pb-20">
      {content ? (
        <>
          {/* Hero */}
          <header className="mb-20 text-center">
            <h1 className="mb-5 font-serif text-3xl font-medium leading-tight text-ink sm:text-[44px]">
              {content.headline}
            </h1>
            <p className="mx-auto mb-8 max-w-[620px] text-base leading-relaxed text-ink-muted">{content.intro}</p>
            <button type="button" onClick={scrollToBooking} className="btn-primary !rounded-full">
              {content.primaryCta}
            </button>
          </header>

          {/* How we help */}
          {content.helpTitle && (
            <section className="mx-auto mb-20 max-w-[640px] text-center">
              <h2 className="mb-6 font-serif text-2xl font-medium text-teal sm:text-[30px]">{content.helpTitle}</h2>
              {content.helpParagraphs.map((p, i) => (
                <p key={i} className="mb-5 text-base leading-[1.85] text-ink-muted">{p}</p>
              ))}
            </section>
          )}

          {/* The journey */}
          {content.journeySteps.length > 0 && (
            <section className="mb-20">
              <div className="mb-10 text-center">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  {t("howItWorks")}
                </p>
                <h2 className="font-serif text-2xl font-medium text-teal sm:text-[30px]">{content.journeyTitle}</h2>
              </div>
              <ol className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {content.journeySteps.map((step, i) => (
                  <li key={i} className="flex flex-col gap-3 rounded-2xl border border-line/20 bg-white p-7">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal/10 font-display text-base font-bold text-teal">
                      {i + 1}
                    </span>
                    <h3 className="font-serif text-lg font-medium leading-snug text-ink">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-ink-muted">{step.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* What's included */}
          {content.includedItems.length > 0 && (
            <section className="mb-20">
              <div className="mx-auto mb-10 max-w-[560px] text-center">
                <h2 className="mb-3 font-serif text-2xl font-medium text-teal sm:text-[30px]">{content.includedTitle}</h2>
                <p className="text-base leading-relaxed text-ink-muted">{content.includedIntro}</p>
              </div>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {content.includedItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-4 rounded-2xl border border-line/20 bg-white p-6">
                    <CheckCircle2 size={22} strokeWidth={1.75} className="mt-0.5 shrink-0 text-teal" />
                    <div>
                      <h3 className="mb-1.5 text-[15px] font-semibold leading-snug text-ink">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-ink-muted">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Closing call to action */}
          {content.closingTitle && (
            <section className="mb-20 rounded-2xl bg-teal/[0.06] px-8 py-12 text-center">
              <h2 className="mb-3 font-serif text-2xl font-medium text-teal sm:text-[30px]">{content.closingTitle}</h2>
              <p className="mx-auto mb-7 max-w-[480px] text-base leading-relaxed text-ink-muted">{content.closingBody}</p>
              <button type="button" onClick={scrollToBooking} className="btn-primary !rounded-full">
                {content.secondaryCta}
              </button>
            </section>
          )}
        </>
      ) : (
        <div className="mb-12 text-center">
          <h1 className="mb-3.5 font-serif text-3xl font-medium leading-tight text-ink sm:text-4xl">{t("fallbackTitle")}</h1>
          <p className="mx-auto max-w-[560px] text-base leading-relaxed text-ink-muted">{t("fallbackText")}</p>
        </div>
      )}

      {/* Booking */}
      <div ref={bookingRef} id="booking" className="scroll-mt-24">
        {content && (
          <h2 className="mb-10 text-center font-serif text-2xl font-medium text-ink sm:text-[30px]">{t("chooseTitle")}</h2>
        )}

        {availableKeys.length === 0 ? (
          <p className="rounded-2xl border border-line/20 bg-white p-8 text-center text-ink-muted">
            {t.rich("noSlots", {
              link: (c) => <Link href="/contact" className="font-semibold text-teal underline">{c}</Link>,
            })}
          </p>
        ) : (
          <>
            <StepLabel number={1} label={t("step1")} />
            <CalendarPicker
              month={calMonth}
              onMonthChange={setCalMonth}
              selected={selectedDate}
              onSelect={(d) => {
                setSelectedDate(d);
                setSelectedSlot(null);
              }}
              available={availableKeys}
            />

            <StepLabel number={2} label={t("step2")} />
            {selectedKey ? (
              <>
                <div className="mb-3 flex flex-wrap gap-2.5">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                        selectedSlot === slot
                          ? "border-teal bg-teal text-white"
                          : "border-line bg-white text-ink hover:border-teal"
                      }`}
                    >
                      {slotLabel(slot, locale)}
                    </button>
                  ))}
                </div>
                <p className="mb-10 text-xs text-ink-muted">
                  {t("tzNote")}
                  {paris && selectedSlot ? ` ${t("tzParis", { slot: slotLabel(selectedSlot, locale), paris })}` : ""}
                </p>
              </>
            ) : (
              <p className="mb-10 text-sm text-ink-muted">{t("pickDate")}</p>
            )}

            <StepLabel number={3} label={t("step3")} />
            <div className="mb-10 flex flex-col gap-3.5">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">{t("fullName")}</label>
                  <input type="text" required placeholder={t("namePh")} value={name} onChange={(e) => setName(e.target.value)} className="field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold text-ink">{t("mobile")}</label>
                  <input type="tel" required placeholder="+91 00000 00000" value={phone} onChange={(e) => setPhone(e.target.value)} className="field" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">{t("email")}</label>
                <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-ink">{t("concern")}</label>
                <textarea placeholder={t("concernPh")} value={concern} onChange={(e) => setConcern(e.target.value)} rows={3} className="field h-auto resize-none py-3 leading-relaxed" />
              </div>
            </div>

            {error && <p role="alert" className="mb-4 text-center text-sm text-clay">{error}</p>}
            <div className="flex justify-center">
              <button
                type="button"
                disabled={!canBook || sending}
                onClick={submitBooking}
                className="btn-primary px-16 disabled:bg-line disabled:text-ink-muted"
              >
                {sending ? t("sending") : t("request")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
