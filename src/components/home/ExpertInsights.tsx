import { getLocale, getTranslations } from "next-intl/server";
import { BlogScrollCard } from "@/components/ui/BlogScrollCard";
import { HScroller } from "@/components/ui/HScroller";
import { getArticleCards } from "@/lib/content";

export async function ExpertInsights() {
  const t = await getTranslations("Home");
  const posts = await getArticleCards(await getLocale());

  return (
    <section className="bg-cream px-6 py-20">
      <div className="mb-14 text-center">
        <h2 className="eyebrow mb-3">{t("insightsTitle")}</h2>
        <p className="text-base text-ink-muted">{t("insightsText")}</p>
      </div>
      <div className="mx-auto max-w-[1100px]">
        <HScroller label={t("articleCount", { count: posts.length })}>
          {posts.map((post) => (
            <div key={post.id} className="w-[300px] shrink-0 snap-start sm:w-[340px]">
              <BlogScrollCard post={post} ctaLabel={t("readArticle")} />
            </div>
          ))}
        </HScroller>
      </div>
    </section>
  );
}
