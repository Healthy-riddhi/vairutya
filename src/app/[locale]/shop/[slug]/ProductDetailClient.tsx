"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Info } from "lucide-react";
import type { Product, ProductDetail } from "@/types/content";
import { useCart } from "@/lib/cart/CartContext";
import { formatMoney } from "@/lib/money";
import { useTranslations } from "next-intl";

type TabDef = { id: string; label: string };

export function ProductDetailClient({
  product,
  details,
}: {
  product: Product;
  details?: ProductDetail;
}) {
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const { getQty, updateQty } = useCart();
  const t = useTranslations("Product");

  const images = [product.image, ...(product.gallery ?? [])];

  // Custom tabs (e.g. the tongue scraper) replace the classic three.
  const tabs: TabDef[] = details?.tabs
    ? details.tabs.map((t) => ({ id: t.id, label: t.label }))
    : [
        details?.benefits?.length && { id: "benefits", label: t("benefits") },
        details?.ingredients && { id: "ingredients", label: t("ingredients") },
        details?.howToUse && { id: "usage", label: t("howToUse") },
      ].filter((t): t is TabDef => Boolean(t));
  const activeTab = activeTabId ?? tabs[0]?.id;
  const customTab = details?.tabs?.find((t) => t.id === activeTab);

  const qty = getQty(product.slug);

  function handleAdd() {
    updateQty(
      {
        slug: product!.slug,
        name: product!.name,
        brand: product!.brand,
        price: product!.price,
        image: product!.image,
      },
      qty + 1
    );
  }

  function handleQtyChange(next: number) {
    updateQty(
      {
        slug: product!.slug,
        name: product!.name,
        brand: product!.brand,
        price: product!.price,
        image: product!.image,
      },
      next
    );
  }

  return (
    <div className="mx-auto max-w-[980px] px-6 py-10 pb-24">
      <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Image gallery */}
        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-[20px] border border-line/15 bg-white">
            <Image
              key={images[activeImage]}
              src={images[activeImage]}
              alt={`${product.name} — view ${activeImage + 1}`}
              fill
              priority={activeImage === 0}
              sizes="(min-width: 768px) 490px, 100vw"
              className="object-cover"
            />
          </div>
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-teal px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
              {t(product.badge === "Best Seller" ? "bestSeller" : "newArrival")}
            </span>
          )}
          {images.length > 1 && (
            <div className="hide-scrollbar mt-3 flex gap-2.5 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={t("showImage", { n: i + 1 })}
                  aria-current={i === activeImage}
                  className={`relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-colors ${
                    i === activeImage
                      ? "border-teal"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="68px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center gap-5">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {product.brand}
            </span>
            <h1 className="mb-3 mt-1.5 font-serif text-[32px] font-medium leading-tight text-teal sm:text-4xl">
              {product.name}
            </h1>
            <p className="text-[15px] leading-relaxed text-ink-muted">
              {product.description}
            </p>
          </div>

          {details && (
            <div className="flex flex-wrap gap-2">
              {details.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-teal/15 bg-teal/5 px-3 py-1.5 text-[11px] font-semibold tracking-[0.03em] text-teal"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <span className="font-display text-[32px] font-extrabold text-teal">
            {formatMoney(product.price, product.currency)}
          </span>

          {qty === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              className="btn-primary w-full max-w-[360px] !rounded-full"
            >
              {t("addToCart")}
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-full border-2 border-teal">
                <button
                  type="button"
                  onClick={() => handleQtyChange(qty - 1)}
                  className="flex h-11 w-11 items-center justify-center text-lg font-bold text-teal"
                >
                  −
                </button>
                <span className="w-10 text-center font-display text-[17px] font-bold text-teal">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => handleQtyChange(qty + 1)}
                  className="flex h-11 w-11 items-center justify-center text-lg font-bold text-teal"
                >
                  +
                </button>
              </div>
              <Link
                href="/cart"
                className="rounded-full border-2 border-teal px-7 py-3.5 text-[13px] font-bold uppercase tracking-[0.08em] text-teal transition-colors hover:bg-teal hover:text-white"
              >
                {t("viewCart")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Detail tabs */}
      {details && tabs.length > 0 && (
        <div>
          <div className="hide-scrollbar mb-7 flex gap-1 overflow-x-auto border-b border-line/25">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`-mb-px shrink-0 border-b-2 px-6 py-2.5 text-[13px] font-semibold tracking-[0.02em] transition-colors ${
                  activeTab === tab.id
                    ? "border-teal text-teal"
                    : "border-transparent text-ink-muted"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {customTab && (
            <div className="flex flex-col gap-4">
              {customTab.sections && (
                <div className="flex flex-col gap-6 rounded-2xl border border-line/15 bg-white p-7">
                  {customTab.sections.map((sec, i) => (
                    <div key={i}>
                      {sec.heading && (
                        <h3 className="mb-2 font-serif text-lg font-medium text-teal">
                          {sec.heading}
                        </h3>
                      )}
                      <p className="text-[15px] leading-loose text-ink">
                        {sec.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {customTab.specs && (
                <dl className="divide-y divide-line/15 rounded-2xl border border-line/15 bg-white px-7">
                  {customTab.specs.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[160px_1fr] sm:gap-6"
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                        {row.label}
                      </dt>
                      <dd className="text-[15px] leading-relaxed text-ink">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              {customTab.note && (
                <div className="flex items-start gap-5 rounded-2xl border border-teal/15 bg-teal/5 p-7">
                  <Info
                    size={28}
                    strokeWidth={1.75}
                    className="shrink-0 text-teal"
                  />
                  <div>
                    <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-teal">
                      {customTab.note.heading}
                    </h3>
                    <p className="text-[15px] leading-loose text-ink">
                      {customTab.note.body}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!customTab && activeTab === "benefits" && details.benefits && (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {details.benefits.map((b, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 rounded-2xl border border-line/15 bg-white px-5 py-4.5"
                >
                  <CheckCircle2
                    size={20}
                    strokeWidth={2}
                    className="mt-0.5 shrink-0 text-teal"
                  />
                  <p className="text-sm leading-relaxed text-ink">{b}</p>
                </div>
              ))}
            </div>
          )}

          {!customTab && activeTab === "ingredients" && details.ingredients && (
            <div className="rounded-2xl border border-line/15 bg-white p-7">
              <p className="text-[15px] leading-loose text-ink">
                {details.ingredients}
              </p>
            </div>
          )}

          {!customTab && activeTab === "usage" && details.howToUse && (
            <div className="flex items-start gap-5 rounded-2xl border border-line/15 bg-white p-7">
              <Info size={28} strokeWidth={1.75} className="shrink-0 text-teal" />
              <p className="text-[15px] leading-loose text-ink">
                {details.howToUse}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
