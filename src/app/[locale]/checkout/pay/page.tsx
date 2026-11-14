import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { Clock } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getOrder } from "@/lib/orders";
import { getBusinessDetails } from "@/lib/business";
import { formatMinor } from "@/lib/money";
import { PAID_STATUSES } from "@/lib/order-status";
import { CopyButton, UtrForm } from "./PayClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Vairutya", robots: { index: false, follow: false } };

export default async function PayPage({ searchParams }: { searchParams: Promise<{ order?: string | string[] }> }) {
  const sp = await searchParams;
  const orderNumber = typeof sp.order === "string" ? sp.order : "";
  const t = await getTranslations("Pay");
  const locale = await getLocale();
  const user = await requireUser(`/checkout/pay?order=${encodeURIComponent(orderNumber)}`);
  const order = orderNumber ? await getOrder(orderNumber, user.id) : null;
  if (!order || order.paymentMethod !== "upi_manual") notFound();
  if (PAID_STATUSES.includes(order.status)) {
    redirect({ href: `/checkout/success?order=${encodeURIComponent(order.orderNumber)}`, locale });
  }

  const shell = (children: React.ReactNode) => (
    <div className="mx-auto max-w-[560px] px-6 py-12 pb-24">{children}</div>
  );

  if (!["pending_payment", "payment_submitted"].includes(order.status)) {
    return shell(
      <div className="text-center">
        <h1 className="mb-3 font-serif text-3xl font-medium text-ink">{t("closedTitle")}</h1>
        <p className="mb-8 text-sm leading-relaxed text-ink-muted">{t("closedText")}</p>
        <Link href="/shop" className="btn-primary !rounded-full">{t("shop")}</Link>
      </div>
    );
  }

  const amount = formatMinor(order.totalMinor, order.currency);

  if (order.status === "payment_submitted") {
    return shell(
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal/10">
          <Clock size={40} strokeWidth={1.75} className="text-teal" />
        </div>
        <h1 className="mb-3 font-serif text-3xl font-medium text-ink">{t("verifyingTitle")}</h1>
        <p className="mb-2 text-sm text-ink-muted">{t("order", { number: order.orderNumber })} · {amount}</p>
        <p className="mb-8 max-w-[440px] text-base leading-relaxed text-ink-muted">{t("verifyingText", { utr: order.utr ?? "" })}</p>
        <div className="mb-8 w-full rounded-2xl border border-line/20 bg-white p-6 text-left">
          <p className="mb-3 text-sm font-semibold text-ink">{t("wrongRef")}</p>
          <UtrForm orderNumber={order.orderNumber} initial={order.utr ?? ""} />
        </div>
        <Link href={`/account/orders/${order.orderNumber}`} className="btn-primary !rounded-full">{t("viewOrder")}</Link>
      </div>
    );
  }

  const biz = await getBusinessDetails();
  if (!biz.upiId) {
    return shell(<p className="text-center text-ink-muted">{t("notSetUp")}</p>);
  }

  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(biz.upiId)}&pn=${encodeURIComponent(biz.upiPayeeName)}` +
    `&am=${(order.totalMinor / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(order.orderNumber)}`;
  const qr = await QRCode.toDataURL(upiUrl, { margin: 1, width: 260 });

  return shell(
    <>
      <h1 className="mb-2 font-serif text-3xl font-medium text-ink">{t("title")}</h1>
      <p className="mb-8 text-sm leading-relaxed text-ink-muted">{t("intro")}</p>

      <div className="mb-6 rounded-2xl border border-line/20 bg-white p-6 text-center">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{t("order", { number: order.orderNumber })}</p>
        <p className="mb-1 text-sm text-ink-muted">{t("amount")}</p>
        <p className="mb-5 font-display text-4xl font-extrabold text-teal">{amount}</p>

        <p className="mb-3 text-sm font-semibold text-ink">{t("step1")}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="UPI QR code" width={220} height={220} className="mx-auto mb-2 rounded-lg" />
        <p className="mb-4 text-xs text-ink-muted">{t("scan")}</p>

        <a href={upiUrl} className="btn-primary mb-5 inline-block !rounded-full sm:hidden">{t("openApp")}</a>

        <p className="mb-2 text-xs text-ink-muted">{t("orId")}</p>
        <div className="mb-3 flex items-center justify-center gap-3">
          <span className="font-mono text-sm font-semibold text-ink">{biz.upiId}</span>
          <CopyButton text={biz.upiId} />
        </div>
        <p className="text-xs text-ink-muted">{t("note", { number: order.orderNumber })}</p>
        {biz.paymentNote && <p className="mt-3 text-xs text-ink-muted">{biz.paymentNote}</p>}
      </div>

      <div className="rounded-2xl border border-line/20 bg-white p-6">
        <p className="mb-3 text-sm font-semibold text-ink">{t("step2")}</p>
        <UtrForm orderNumber={order.orderNumber} />
      </div>
    </>
  );
}
