"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Product } from "@/types/content";
import { useCart } from "@/lib/cart/CartContext";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";

export function ShopCard({ product }: { product: Product }) {
  const { getQty, updateQty } = useCart();
  const t = useTranslations("Shop");
  const qty = getQty(product.slug);
  const inCart = qty > 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    updateQty(
      {
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
      },
      qty + 1
    );
  }

  return (
    <div className="flex flex-col">
      <Link
        href={`/shop/${product.slug}`}
        className="group relative block aspect-square overflow-hidden rounded-xl bg-white"
      >
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-teal px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
            {t(product.badge === "Best Seller" ? "bestSeller" : "newArrival")}
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 pt-4.5 pb-1">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
          {product.brand}
        </span>
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-base font-bold leading-snug text-teal">
            {product.name}
          </h3>
        </Link>
        <p className="flex-1 text-[13px] leading-relaxed text-ink-muted">
          {product.description}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <span className="font-display text-lg font-bold text-teal">
            {formatMoney(product.price, product.currency)}
          </span>
          <button
            type="button"
            onClick={handleAdd}
            className={`min-h-10 rounded-full border-[1.5px] px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
              inCart
                ? "border-line bg-stone text-teal"
                : "border-teal bg-teal text-white hover:opacity-90"
            }`}
          >
            {inCart ? t("added") : t("add")}
          </button>
        </div>
      </div>
    </div>
  );
}
