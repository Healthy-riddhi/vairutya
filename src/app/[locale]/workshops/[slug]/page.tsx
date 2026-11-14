import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { WorkshopDetailClient } from "./WorkshopDetailClient";
import { getWorkshopBySlug } from "@/lib/content";

export default async function WorkshopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const workshop = await getWorkshopBySlug(slug, await getLocale());
  if (!workshop) notFound();
  return <WorkshopDetailClient workshop={workshop} />;
}
