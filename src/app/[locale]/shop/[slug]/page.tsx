import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { ProductDetailClient } from "./ProductDetailClient";
import { getProductBySlug } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getProductBySlug(slug, await getLocale());
  if (!item) return {};
  return { title: `${item.product.name} — Vairutya`, description: item.product.description };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getProductBySlug(slug, await getLocale());
  if (!item) notFound();
  return <ProductDetailClient product={item.product} details={item.details} />;
}
