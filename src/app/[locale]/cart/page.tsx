"use client";

import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart/CartContext";
import { useQuote } from "@/lib/use-quote";
import { formatMinor } from "@/lib/money";

const MAX_QTY = 10;

export default function CartPage() {
  const t = useTranslations("Cart");
  const router = useRouter();
  const { items, updateQty, ready } = useCart();
  const { quote, error, loading } = useQuote(items);

  function setQty(item: CartItem, qty: number) {
    const { slug, name, brand, price, image } = item;
    updateQty({ slug, name, brand, price, image }, Math.min(MAX_QTY, qty));
  }

  if (!ready) return <div className="mx-auto max-w-[720px] px-6 py-24" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-24 text-center">
        <ShoppingCart size={64} strokeWidth={1.5} className="mx-auto mb-4 text-line" />
        <p className="mb-2 font-serif text-2xl font-medium text-ink">{t("empty")}</p>
        <p className="mb-6 text-sm text-ink-muted">{t("emptyText")}</p>
        <Link href="/shop" className="btn-primary !rounded-full">{t("browse")}</Link>
      </div>
    );
  }

  const lineFor = (slug: string) => quote?.lines.find((l) => l.slug === slug);
  const money = (m: number) => formatMinor(m, quote?.currency ?? "INR");

  return (
    <div className="mx-auto max-w-[720px] px-6 py-8 pb-28">
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const line = lineFor(item.slug);
          return (
            <div key={item.slug} className="flex items-center gap-5 rounded-2xl border border-line/20 bg-white p-5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-stone">
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              </div>

              <div className="flex-1">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">{item.brand}</p>
                <p className="mb-3 font-display text-[15px] font-bold text-teal">{item.name}</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center overflow-hidden rounded-full border-[1.5px] border-line">
                    <button type="button" onClick={() => setQty(item, item.qty - 1)} aria-label={t("decrease")} className="flex h-9 w-9 items-center justify-center text-lg text-ink">−</button>
                    <span className="w-8 text-center font-display text-[15px] font-bold text-ink">{item.qty}</span>
                    <button type="button" onClick={() => setQty(item, item.qty + 1)} disabled={item.qty >= MAX_QTY} aria-label={t("increase")} className="flex h-9 w-9 items-center justify-center text-lg text-ink disabled:opacity-30">+</button>
                  </div>
                  <span className="font-display text-[17px] font-bold text-teal">{line ? money(line.lineMinor) : "…"}</span>
                </div>
              </div>

              <button type="button" onClick={() => setQty(item, 0)} aria-label={t("remove", { name: item.name })} className="self-start text-ink-muted hover:text-ink">
                <Trash2 size={20} strokeWidth={1.75} />
              </button>
            </div>
          );
        })}

        {error && <p className="rounded-2xl border border-line/20 bg-white p-5 text-sm text-ink">{error}</p>}

        <div className="mt-2 rounded-2xl border border-line/20 bg-white p-6">
          <h3 className="mb-4 font-display text-[15px] font-bold text-ink">{t("summary")}</h3>
          {quote && (
            <>
              {quote.lines.map((l) => (
                <div key={l.slug} className="mb-2.5 flex justify-between text-[13px]">
                  <span className="text-ink-muted">{l.name} × {l.qty}</span>
                  <span className="font-semibold text-ink">{money(l.lineMinor)}</span>
                </div>
              ))}
              <div className="mb-2.5 flex justify-between text-[13px]">
                <span className="text-ink-muted">{t("shipping")}</span>
                <span className="font-semibold text-ink">{quote.shippingMinor === 0 ? t("free") : money(quote.shippingMinor)}</span>
              </div>
              {quote.freeShippingAwayMinor !== null && (
                <p className="mb-2.5 text-xs text-teal">{t("freeAway", { amount: money(quote.freeShippingAwayMinor) })}</p>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-line/20 pt-3.5">
                <span className="font-display text-base font-bold text-ink">{t("total")}</span>
                <span className="font-display text-xl font-bold text-teal">{money(quote.totalMinor)}</span>
              </div>
              {quote.taxIncludedMinor ? (
                <p className="mt-1 text-right text-xs text-ink-muted">{t("gst", { amount: money(quote.taxIncludedMinor) })}</p>
              ) : null}
            </>
          )}
          {!quote && !error && <p className="text-sm text-ink-muted">{loading ? t("checking") : ""}</p>}
        </div>

        <button
          type="button"
          disabled={!quote || loading}
          onClick={() => router.push("/checkout")}
          className="btn-primary mt-2 w-full !rounded-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("proceed")}
        </button>
      </div>
    </div>
  );
}
