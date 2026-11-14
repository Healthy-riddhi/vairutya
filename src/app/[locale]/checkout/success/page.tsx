import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getOrder } from "@/lib/orders";
import { formatMinor } from "@/lib/money";
import { PAID_STATUSES } from "@/lib/order-status";

export const metadata = { title: "Vairutya" };
export const dynamic = "force-dynamic";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order: orderNumber = "" } = await searchParams;
  const t = await getTranslations("Orders");
  await getLocale();
  const user = await requireUser("/account/orders");
  const order = orderNumber ? await getOrder(orderNumber, user.id) : null;
  const paid = order ? PAID_STATUSES.includes(order.status) : false;

  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center px-6 py-24 text-center">
      {paid ? (
        <CheckCircle2 size={56} strokeWidth={1.75} className="mb-5 text-teal" />
      ) : (
        <Clock size={56} strokeWidth={1.75} className="mb-5 text-teal" />
      )}
      <h1 className="mb-3 font-serif text-3xl font-medium text-ink">{paid ? t("thanks") : t("confirming")}</h1>
      {order ? (
        <>
          <p className="mb-1 text-[15px] text-ink-muted">{t("order", { number: order.orderNumber })}</p>
          <p className="mb-2 font-display text-lg font-bold text-teal">{formatMinor(order.totalMinor, order.currency)}</p>
          <p className="mb-8 text-sm text-ink-muted">{paid ? t("emailOnWay", { email: order.email }) : t("takeMinute")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={`/account/orders/${order.orderNumber}`} className="btn-primary !rounded-full">{t("view")}</Link>
            <Link href="/shop" className="rounded-full border-2 border-teal px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.08em] text-teal">{t("keep")}</Link>
          </div>
        </>
      ) : (
        <Link href="/account/orders" className="btn-primary mt-6 !rounded-full">{t("myOrders")}</Link>
      )}
    </div>
  );
}
