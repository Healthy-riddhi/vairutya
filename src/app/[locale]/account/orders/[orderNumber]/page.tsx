import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/session";
import { getOrder } from "@/lib/orders";
import { formatMinor } from "@/lib/money";
import { formatOrderDate } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  const t = await getTranslations("Orders");
  const ts = await getTranslations("Status");
  const locale = await getLocale();
  const user = await requireUser(`/account/orders/${orderNumber}`);
  const o = await getOrder(orderNumber, user.id);
  if (!o) notFound();

  const money = (m: number) => formatMinor(m, o.currency);
  const a = o.shippingAddress ?? {};
  const addr = [a.name, a.line1, a.line2, [a.postcode, a.city].filter(Boolean).join(" "), a.state, new Intl.DisplayNames([locale], { type: "region" }).of(o.country) ?? o.country].filter(Boolean);

  return (
    <div className="mx-auto max-w-[720px] px-6 py-10 pb-24">
      <Link href="/account/orders" className="mb-5 inline-block text-sm text-ink-muted underline">{t("allOrders")}</Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">{o.orderNumber}</h1>
          <p className="text-sm text-ink-muted">{t("placed", { date: formatOrderDate(o.createdAt, locale) })}</p>
        </div>
        <span className="rounded-full border border-teal/15 bg-teal/5 px-4 py-1.5 text-xs font-semibold text-teal">
          {ts.has(o.status) ? ts(o.status) : o.status}
        </span>
      </div>

      {o.status === "pending_payment" && o.paymentMethod === "upi_manual" && (
        <Link href={`/checkout/pay?order=${o.orderNumber}`} className="btn-primary mb-5 inline-block !rounded-full">
          {t("completePayment")}
        </Link>
      )}

      {o.trackingNumber && (
        <div className="mb-5 rounded-2xl border border-teal/15 bg-teal/5 p-5 text-sm text-ink">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-teal">{t("tracking")}</p>
          <p>{o.carrier ? `${o.carrier} · ` : ""}<strong>{o.trackingNumber}</strong></p>
        </div>
      )}

      <div className="mb-5 rounded-2xl border border-line/20 bg-white p-6">
        {o.items.map((i) => (
          <div key={i.slug} className="mb-2.5 flex justify-between text-[14px]">
            <span className="text-ink-muted">{i.name} × {i.qty}</span>
            <span className="font-semibold text-ink">{money(i.lineMinor)}</span>
          </div>
        ))}
        <div className="mb-2.5 flex justify-between text-[14px]">
          <span className="text-ink-muted">{t("shipping")}</span>
          <span className="font-semibold text-ink">{o.shippingMinor === 0 ? t("free") : money(o.shippingMinor)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-line/20 pt-3.5">
          <span className="font-display text-base font-bold text-ink">{t("total")}</span>
          <span className="font-display text-xl font-bold text-teal">{money(o.totalMinor)}</span>
        </div>
        {o.taxIncludedMinor ? <p className="mt-1 text-right text-xs text-ink-muted">{t("gst", { amount: money(o.taxIncludedMinor) })}</p> : null}
      </div>

      <div className="rounded-2xl border border-line/20 bg-white p-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{t("shippingTo")}</p>
        <p className="text-[15px] leading-relaxed text-ink">
          {addr.map((l, i) => (<span key={i}>{String(l)}<br /></span>))}
        </p>
      </div>

      <p className="mt-6 text-xs text-ink-muted">
        {t.rich("help", {
          ship: (c) => <Link href="/shipping" className="underline">{c}</Link>,
          refund: (c) => <Link href="/refund-policy" className="underline">{c}</Link>,
        })}
      </p>
    </div>
  );
}
