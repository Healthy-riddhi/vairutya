import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { RecipeDetailClient } from "./RecipeDetailClient";
import { getRecipeBySlug } from "@/lib/content";

export default async function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug, await getLocale());
  if (!recipe) notFound();
  return <RecipeDetailClient recipe={recipe} />;
}
