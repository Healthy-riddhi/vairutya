import { getLocale, getTranslations } from "next-intl/server";
import { RecipeBook } from "@/components/recipes/RecipeBook";
import { getRecipes } from "@/lib/content";

export default async function RecipesListPage() {
  const t = await getTranslations("Recipes");
  const recipes = await getRecipes(await getLocale());
  return (
    <div className="mx-auto max-w-[1040px] overflow-x-clip px-7 py-8 pb-12">
      <p className="mb-10 text-center text-[15px] text-ink-muted">{t("subtitle")}</p>
      <RecipeBook recipes={recipes} />
    </div>
  );
}
