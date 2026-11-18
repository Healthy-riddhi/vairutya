import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { Clock } from "lucide-react";
import { getRequest } from "@/lib/consultation-api";
import { getBusinessDetails } from "@/lib/business";
import { formatMinor } from "@/lib/money";
import { longDate, slotLabel } from "@/lib/consultation";
import { CopyButton } from "../../checkout/pay/PayClient";
import { ConsultationUtrForm } from "./ConsultationUtrForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vairutya", robots: { index: false, follow: false } };

/** Where a consultation customer pays by UPI. Opened with the booking's own secret link, so no sign-in is needed. */
export default async function ConsultationPayPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[]; t?: string | string[] }>;
}) {
  const sp = await searchParams;
  const ref = typeof sp.ref === "string" ? sp.ref : "";
  const token = typeof sp.t === "string" ? sp.t : "";
  const t = await getTranslations("ConsultationPay");
  const pay = await getTranslations("Pay");
  const locale = await getLocale();
  const r = ref && token ? await getRequest(ref, token) : null;
  if (!r || r.paymentMethod !== "upi_manual" || !r.amountMinor || !r.currency) notFound();

  const status = `/consultation/confirmed?ref=${encodeURIComponent(r.reference)}&t=${encodeURIComponent(token)}`;
  if (r.paymentStatus === "paid") redirect({ href: status, locale });

  const shell = (children: React.ReactNode) => <div className="mx-auto max-w-[560px] px-6 py-12 pb-24">{children}</div>;

  if (r.status === "cancelled" || !["pending_payment", "payment_submitted"].includes(r.paymentStatus ?? "")) {
    return shell(
      <div className="text-center">
        <h1 className="mb-3 font-serif text-3xl font-medium text-ink">{t("closedTitle")}</h1>
        <p className="mb-8 text-sm leading-relaxed text-ink-muted">{t("closedText")}</p>
        <Link href="/consultation" className="btn-primary !rounded-full">{t("rebook")}</Link>
      </div>
    );
  }

  const amount = formatMinor(r.amountMinor, r.currency);
  const when = t("slot", { date: longDate(r.date, locale), time: slotLabel(r.slot, locale) });
  const bought = [r.packageTitle, r.addOnTitle].filter(Boolean).join(" + ");

  if (r.paymentStatus === "payment_submitted") {
    return shell(
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal/10">
          <Clock size={40} strokeWidth={1.75} className="text-teal" />
        </div>
        <h1 className="mb-3 font-serif text-3xl font-medium text-ink">{t("verifyingTitle")}</h1>
        <p className="mb-2 text-sm text-ink-muted">{t("booking", { ref: r.reference })} · {amount}</p>
        {bought && <p className="mb-2 text-sm font-semibold text-ink">{bought}</p>}
        <p className="mb-2 text-sm text-ink-muted first-letter:uppercase">{when}</p>
        <p className="mb-8 max-w-[440px] text-base leading-relaxed text-ink-muted">{t("verifyingText", { utr: r.utr ?? "" })}</p>
        <div className="mb-8 w-full rounded-2xl border border-line/20 bg-white p-6 text-left">
          <p className="mb-3 text-sm font-semibold text-ink">{pay("wrongRef")}</p>
          <ConsultationUtrForm reference={r.reference} token={token} initial={r.utr ?? ""} />
        </div>
        <Link href={status} className="btn-primary !rounded-full">{t("viewStatus")}</Link>
      </div>
    );
  }

  const biz = await getBusinessDetails();
  if (!biz.upiId) return shell(<p className="text-center text-ink-muted">{pay("notSetUp")}</p>);

  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(biz.upiId)}&pn=${encodeURIComponent(biz.upiPayeeName)}` +
    `&am=${(r.amountMinor / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(r.reference)}`;
  const qr = await QRCode.toDataURL(upiUrl, { margin: 1, width: 260 });

  return shell(
    <>
      <h1 className="mb-2 font-serif text-3xl font-medium text-ink">{t("title")}</h1>
      <p className="mb-8 text-sm leading-relaxed text-ink-muted">{t("intro")}</p>

      <div className="mb-6 rounded-2xl border border-line/20 bg-white p-6 text-center">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{t("booking", { ref: r.reference })}</p>
        {bought && <p className="mb-1 text-sm font-semibold text-ink">{bought}</p>}
        <p className="mb-4 text-sm text-ink-muted first-letter:uppercase">{when}</p>
        <p className="mb-1 text-sm text-ink-muted">{pay("amount")}</p>
        <p className="mb-5 font-display text-4xl font-extrabold text-teal">{amount}</p>

        <p className="mb-3 text-sm font-semibold text-ink">{pay("step1")}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="UPI QR code" width={220} height={220} className="mx-auto mb-2 rounded-lg" />
        <p className="mb-4 text-xs text-ink-muted">{pay("scan")}</p>

        <a href={upiUrl} className="btn-primary mb-5 inline-block !rounded-full sm:hidden">{pay("openApp")}</a>

        <p className="mb-2 text-xs text-ink-muted">{pay("orId")}</p>
        <div className="mb-3 flex items-center justify-center gap-3">
          <span className="font-mono text-sm font-semibold text-ink">{biz.upiId}</span>
          <CopyButton text={biz.upiId} />
        </div>
        <p className="text-xs text-ink-muted">{t("note", { ref: r.reference })}</p>
        {biz.paymentNote && <p className="mt-3 text-xs text-ink-muted">{biz.paymentNote}</p>}
      </div>

      <div className="rounded-2xl border border-line/20 bg-white p-6">
        <p className="mb-3 text-sm font-semibold text-ink">{pay("step2")}</p>
        <ConsultationUtrForm reference={r.reference} token={token} />
      </div>
    </>
  );
}
