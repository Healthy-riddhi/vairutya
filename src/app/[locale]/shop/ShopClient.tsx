"use client";

import { useTranslations } from "next-intl";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShopCard } from "@/components/ui/ShopCard";
import type { Product } from "@/types/content";

export function ShopClient({ products }: { products: Product[] }) {
  const t = useTranslations("Shop");
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 pb-24">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

      {products.length === 0 ? (
        <p className="mt-16 text-center text-ink-muted">{t("empty")}</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ShopCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
