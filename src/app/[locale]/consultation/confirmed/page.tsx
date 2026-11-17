import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { CheckCircle2, Clock, Info } from "lucide-react";
import { getRequest } from "@/lib/consultation-api";
import { longDate, parisLabel, slotLabel } from "@/lib/consultation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vairutya", robots: { index: false, follow: false } };

function Shell({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal/10">{icon}</div>
      <h1 className="mb-4 font-serif text-3xl font-medium text-ink">{title}</h1>
      {children}
    </div>
  );
}

export default async function ConsultationStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[]; t?: string | string[] }>;
}) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : "";
  const token = typeof sp.t === "string" ? sp.t : "";
  const t = await getTranslations("ConsultationStatus");
  const locale = await getLocale();
  const r = ref && token ? await getRequest(ref, token) : null;
  const icon = (c: ReactNode) => c;

  if (!r) {
    return (
      <Shell icon={icon(<Info size={40} strokeWidth={1.75} className="text-teal" />)} title={t("notFoundTitle")}>
        <p className="mb-8 max-w-[440px] text-base leading-relaxed text-ink-muted">{t("notFoundText")}</p>
        <Link href="/contact" className="btn-primary !rounded-full">{t("contact")}</Link>
      </Shell>
    );
  }

  const date = longDate(r.date, locale);
  const time = slotLabel(r.slot, locale);

  if (r.status === "cancelled") {
    return (
      <Shell icon={icon(<Info size={40} strokeWidth={1.75} className="text-teal" />)} title={t("cancelledTitle")}>
        <p className="mb-8 max-w-[440px] text-base leading-relaxed text-ink-muted">{t("cancelledText")}</p>
        <Link href="/consultation" className="btn-primary !rounded-full">{t("rebook")}</Link>
      </Shell>
    );
  }

  if (r.status === "requested" && r.paymentStatus === "pending_payment" && r.paymentMethod === "upi_manual") {
    // They haven't paid yet: back to the payment page
    redirect({ href: `/consultation/pay?ref=${encodeURIComponent(r.reference)}&t=${encodeURIComponent(token)}`, locale });
  }

  if (r.status === "requested" && (r.paymentStatus === "pending_payment" || r.paymentStatus === "payment_failed")) {
    return (
      <Shell icon={icon(<Info size={40} strokeWidth={1.75} className="text-teal" />)} title={t("unpaidTitle")}>
        <p className="mb-8 max-w-[440px] text-base leading-relaxed text-ink-muted">{t("unpaidText")}</p>
        <Link href="/consultation" className="btn-primary !rounded-full">{t("rebook")}</Link>
      </Shell>
    );
  }

  if (r.status === "requested" && r.paymentStatus === "payment_submitted") {
    return (
      <Shell icon={icon(<Clock size={40} strokeWidth={1.75} className="text-teal" />)} title={t("verifyingTitle")}>
        <p className="mb-3 max-w-[440px] text-base leading-relaxed text-ink-muted">{t("verifyingText")}</p>
        <p className="mb-8 text-xs text-ink-muted">{t("reference", { ref: r.reference })}</p>
        <Link href="/" className="btn-primary !rounded-full">{t("home")}</Link>
      </Shell>
    );
  }

  if (r.status === "requested" && r.paymentStatus === "paid") {
    return (
      <Shell icon={icon(<CheckCircle2 size={40} strokeWidth={1.75} className="text-teal" />)} title={t("paidTitle")}>
        <p className="mb-3 max-w-[440px] text-base leading-relaxed text-ink-muted">{t("paidText", { date, time })}</p>
        <p className="mb-8 text-xs text-ink-muted">{t("reference", { ref: r.reference })}</p>
        <Link href="/" className="btn-primary !rounded-full">{t("home")}</Link>
      </Shell>
    );
  }

  if (r.status === "requested") {
    return (
      <Shell icon={icon(<Clock size={40} strokeWidth={1.75} className="text-teal" />)} title={t("pendingTitle")}>
        <p className="mb-3 max-w-[440px] text-base leading-relaxed text-ink-muted">{t("pendingText", { date, time })}</p>
        <p className="mb-8 text-xs text-ink-muted">{t("reference", { ref: r.reference })}</p>
        <Link href="/" className="btn-primary !rounded-full">{t("home")}</Link>
      </Shell>
    );
  }

  const paris = locale === "fr" ? parisLabel(r.date, r.slot) : null;
  const safeLink = r.meetingLink && /^https?:\/\//i.test(r.meetingLink) ? r.meetingLink : null;

  return (
    <Shell icon={icon(<CheckCircle2 size={40} strokeWidth={1.75} className="text-teal" />)} title={t("confirmedTitle")}>
      <p className="mb-6 max-w-[440px] text-base leading-relaxed text-ink-muted">
        {t("confirmedText", { name: r.firstName || (locale === "fr" ? "à vous" : "there") })}
      </p>

      <div className="mb-6 w-full rounded-2xl border border-line/20 bg-white p-6 text-left">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{t("when")}</p>
        <p className="font-display text-lg font-bold capitalize text-teal">{date}</p>
        <p className="text-[15px] text-ink">{t("timeIst", { time })}</p>
        {paris && <p className="text-sm text-ink-muted">{t("timeParis", { time: paris })}</p>}
        <p className="mt-3 text-xs text-ink-muted">{t("reference", { ref: r.reference })}</p>
      </div>

      {r.note && (
        <div className="mb-6 w-full whitespace-pre-line rounded-r-xl border-l-4 border-teal bg-teal/[0.04] px-5 py-4 text-left text-sm leading-relaxed text-ink">
          {r.note}
        </div>
      )}

      {safeLink && (
        <a href={safeLink} target="_blank" rel="noopener noreferrer" className="btn-primary mb-6 !rounded-full">
          {t("join")}
        </a>
      )}

      <p className="text-sm text-ink-muted">
        {t.rich("change", {
          link: (c) => <Link href="/contact" className="font-semibold text-teal underline">{c}</Link>,
        })}
      </p>
    </Shell>
  );
}
