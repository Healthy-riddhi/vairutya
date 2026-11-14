import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/session";
import { listOrders } from "@/lib/orders";
import { formatMinor } from "@/lib/money";
import { formatOrderDate } from "@/lib/order-status";

export const metadata = { title: "Vairutya" };
export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const t = await getTranslations("Orders");
  const ts = await getTranslations("Status");
  const locale = await getLocale();
  const user = await requireUser("/account/orders");
  const orders = await listOrders(user.id);

  return (
    <div className="mx-auto max-w-[720px] px-6 py-10 pb-24">
      <h1 className="mb-8 font-serif text-3xl font-medium text-ink">{t("title")}</h1>
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-line/20 bg-white p-8 text-center">
          <p className="mb-4 text-sm text-ink-muted">{t("empty")}</p>
          <Link href="/shop" className="btn-primary !rounded-full">{t("browse")}</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <Link
              key={o.orderNumber}
              href={`/account/orders/${o.orderNumber}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line/20 bg-white p-5 transition-colors hover:border-teal/40"
            >
              <div>
                <p className="font-display text-[15px] font-bold text-teal">{o.orderNumber}</p>
                <p className="text-xs text-ink-muted">
                  {formatOrderDate(o.createdAt, locale)} · {t("items", { count: o.items.reduce((s, i) => s + i.qty, 0) })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink">{formatMinor(o.totalMinor, o.currency)}</p>
                <p className="text-xs text-ink-muted">{ts.has(o.status) ? ts(o.status) : o.status}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
