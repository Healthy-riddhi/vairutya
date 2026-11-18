"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import { CalendarPicker } from "@/components/consultation/CalendarPicker";
import { StepLabel } from "@/components/consultation/StepLabel";
import type { ConsultationContent } from "@/types/content";
import { parisLabel, slotLabel } from "@/lib/consultation";
import { formatMinor, type Currency } from "@/lib/money";
import { perMonthLabel, type ConsultationPackage } from "@/lib/consultation-packages";
import { loadRazorpay, type PaymentResponse } from "@/lib/razorpay-client";

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function ConsultationClient({
  content,
  days,
  feeMinor,
  packages,
}: {
  content: ConsultationContent | null;
  /** Open slots from Strapi: { "2026-12-04": ["10:00", "11:00"] } */
  days: Record<string, string[]>;
  /** Consultation fee in paise/cents for this visitor's site. 0 means no payment. */
  feeMinor: number;
  /** What can be booked, from Strapi (Consultation Package). Empty: the single fee above applies. */
  packages: ConsultationPackage[];
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
  const bases = packages.filter((p) => p.kind === "base");
  const programs = packages.filter((p) => p.kind === "program");
  const addOns = packages.filter((p) => p.kind === "addon");
  const hasPackages = bases.length + programs.length > 0;
  const [pkgSlug, setPkgSlug] = useState(bases[0]?.slug ?? programs[0]?.slug ?? "");
  const [addOnSlug, setAddOnSlug] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bookingRef = useRef<HTMLDivElement>(null);

  const selectedKey = selectedDate ? keyOf(selectedDate) : null;
  const slots = selectedKey ? (days[selectedKey] ?? []) : [];
  const slotValid = selectedSlot !== null && slots.includes(selectedSlot);
  const paris =
    locale === "fr" && selectedKey && selectedSlot && slotValid ? parisLabel(selectedKey, selectedSlot) : null;

  const currency: Currency = locale === "fr" ? "EUR" : "INR";
  const chosen = hasPackages ? [...bases, ...programs].find((p) => p.slug === pkgSlug) : undefined;
  // An add-on only goes with a base package
  const chosenAddOn = chosen?.kind === "base" ? addOns.find((a) => a.slug === addOnSlug) : undefined;
  const totalMinor = hasPackages ? (chosen?.priceMinor ?? 0) + (chosenAddOn?.priceMinor ?? 0) : feeMinor;
  const fee = totalMinor > 0 ? formatMinor(totalMinor, currency) : null;
  // The step numbers shift by one when there is a "choose your consultation" step in front
  const n = hasPackages ? 1 : 0;
  const canBook = Boolean(
    (!hasPackages || chosen) && selectedKey && slotValid && name.trim() && phone.trim() && email.trim()
  );

  function choosePackage(slug: string) {
    setPkgSlug(slug);
    if (![...bases].some((b) => b.slug === slug)) setAddOnSlug(""); // add-ons are only for the base package
  }

  async function submitBooking() {
    if (!canBook || sending || !selectedKey || !selectedSlot) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, email, concern, date: selectedKey, slot: selectedSlot, locale,
          packageSlug: hasPackages ? pkgSlug : "",
          addOnSlug: chosenAddOn ? chosenAddOn.slug : "",
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (data?.code === "slot_unavailable") {
          router.refresh(); // reload the open slots
          throw new Error(t("taken"));
        }
        if (data?.code === "package_invalid") router.refresh(); // reload what is on offer
        if (data?.code === "payments_fr_off") throw new Error(t("frSoon"));
        if (data?.code === "payments_off") throw new Error(t("payOff"));
        throw new Error(data?.error ?? t("generic"));
      }
      const q = `ref=${encodeURIComponent(data.reference)}&t=${encodeURIComponent(data.token)}`;

      // UPI: the payment page opens straight away, like a product order
      if (data.mode === "upi") {
        router.push(`/consultation/pay?${q}`);
        return;
      }
      // Free request (no fee set): straight to the status page
      if (data.mode !== "razorpay") {
        router.push(`/consultation/confirmed?${q}`);
        return;
      }

      // Razorpay: its payment window opens straight away
      const Razorpay = await loadRazorpay(t("errLoad"));
      const rzp = new Razorpay({
        key: data.keyId,
        amount: data.amountMinor,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "Vairutya",
        description: data.reference,
        prefill: data.prefill,
        theme: { color: "#003b43" },
        modal: { ondismiss: () => setSending(false) },
        handler: async (r: PaymentResponse) => {
          try {
            const v = await fetch("/api/consultation/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(r),
            });
            if (!v.ok) throw new Error("verify failed");
            router.push(`/consultation/confirmed?${q}`);
          } catch {
            setError(t("errConfirm", { ref: data.reference }));
            setSending(false);
          }
        },
      });
      rzp.on("payment.failed", (r) => setError(r.error?.description ?? t("errFailed")));
      rzp.open();
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
            {hasPackages && (
              <>
                <StepLabel number={1} label={t("stepPackage")} />
                <div className="mb-12">
                  {bases.length > 0 && (
                    <div className="mb-8">
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{t("startHere")}</p>
                      <div className="grid grid-cols-1 gap-4">
                        {bases.map((b) => (
                          <div key={b.slug}>
                            <PackageCard pkg={b} selected={pkgSlug === b.slug} onSelect={() => choosePackage(b.slug)} currency={currency} wide />
                            {pkgSlug === b.slug && addOns.length > 0 && (
                              <div className="mt-3 rounded-2xl border border-line/20 bg-white p-5">
                                <p className="mb-3 text-[13px] font-semibold text-ink">{t("addOnTitle")}</p>
                                <div role="radiogroup" aria-label={t("addOnTitle")} className="flex flex-col gap-2.5">
                                  <AddOnRow label={t("addOnNone")} selected={addOnSlug === ""} onSelect={() => setAddOnSlug("")} />
                                  {addOns.map((a) => (
                                    <AddOnRow
                                      key={a.slug}
                                      label={a.title}
                                      detail={a.includes.join(" ")}
                                      price={`+${formatMinor(a.priceMinor, currency)}`}
                                      total={t("addOnTotal", { amount: formatMinor(b.priceMinor + a.priceMinor, currency) })}
                                      selected={addOnSlug === a.slug}
                                      onSelect={() => setAddOnSlug(a.slug)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {programs.length > 0 && (
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{t("programsTitle")}</p>
                      <p className="mb-4 text-sm leading-relaxed text-ink-muted">{t("programsIntro")}</p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {programs.map((p) => (
                          <PackageCard key={p.slug} pkg={p} selected={pkgSlug === p.slug} onSelect={() => choosePackage(p.slug)} currency={currency} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <StepLabel number={1 + n} label={t("step1")} />
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

            <StepLabel number={2 + n} label={t("step2")} />
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

            <StepLabel number={3 + n} label={t("step3")} />
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

            {fee && hasPackages && chosen && (
              <p className="mb-4 text-center text-sm text-ink-muted">
                {t("yourChoice", { items: [chosen.title, chosenAddOn?.title].filter(Boolean).join(" + "), amount: fee })}
              </p>
            )}
            {fee && !hasPackages && <p className="mb-4 text-center text-sm text-ink-muted">{t("feeNote", { amount: fee })}</p>}
            {error && <p role="alert" className="mb-4 text-center text-sm text-clay">{error}</p>}
            <div className="flex justify-center">
              <button
                type="button"
                disabled={!canBook || sending}
                onClick={submitBooking}
                className="btn-primary px-16 disabled:bg-line disabled:text-ink-muted"
              >
                {sending ? (fee ? t("opening") : t("sending")) : fee ? t("continuePay", { amount: fee }) : t("request")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** One option you can pick: the starter package or a long-term program. */
function PackageCard({
  pkg,
  selected,
  onSelect,
  currency,
  wide = false,
}: {
  pkg: ConsultationPackage;
  selected: boolean;
  onSelect: () => void;
  currency: Currency;
  wide?: boolean;
}) {
  const t = useTranslations("Consultation");
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full flex-col rounded-2xl border bg-white p-6 text-left transition-colors ${
        wide ? "" : "h-full" /* programs sit in a row and share one height */
      } ${selected ? "border-teal ring-2 ring-teal/30" : "border-line/30 hover:border-teal"}`}
    >
      <span className="mb-4 flex items-start justify-between gap-3">
        <span>
          {pkg.months && (
            <span className="mb-2 inline-block rounded-full bg-teal/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-teal">
              {t("months", { count: pkg.months })}
            </span>
          )}
          <span className="block font-serif text-xl font-medium leading-snug text-ink">{pkg.title}</span>
        </span>
        <span
          aria-hidden
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-teal bg-teal" : "border-line bg-white"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
      </span>
      <span className="mb-1 block font-display text-2xl font-extrabold text-teal">{formatMinor(pkg.priceMinor, currency)}</span>
      {pkg.months ? (
        <span className="mb-4 block text-xs text-ink-muted">{t("perMonth", { amount: perMonthLabel(pkg.priceMinor, pkg.months, currency) })}</span>
      ) : (
        <span className="mb-4 block" />
      )}
      {pkg.idealFor && (
        <span className="mb-4 block text-sm leading-relaxed text-ink">
          <span className="font-semibold">{t("idealFor")}</span> {pkg.idealFor}
        </span>
      )}
      <span className={`block ${wide ? "grid grid-cols-1 gap-x-6 sm:grid-cols-2" : ""}`}>
        {pkg.includes.map((item, i) => (
          <span key={i} className="mb-2 flex items-start gap-2 text-[13px] leading-relaxed text-ink-muted">
            <CheckCircle2 size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-teal" />
            <span>{item}</span>
          </span>
        ))}
      </span>
    </button>
  );
}

/** One row of the add-on choice under the starter package. */
function AddOnRow({
  label,
  detail,
  price,
  total,
  selected,
  onSelect,
}: {
  label: string;
  detail?: string;
  price?: string;
  total?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
        selected ? "border-teal bg-teal/[0.05]" : "border-line/30 hover:border-teal"
      }`}
    >
      <span
        aria-hidden
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-teal bg-teal" : "border-line bg-white"
        }`}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {detail && <span className="mt-0.5 block text-[13px] leading-relaxed text-ink-muted">{detail}</span>}
      </span>
      {price && (
        <span className="shrink-0 text-right">
          <span className="block text-sm font-semibold text-ink">{price}</span>
          {total && <span className="block text-[11px] text-ink-muted">{total}</span>}
        </span>
      )}
    </button>
  );
}
