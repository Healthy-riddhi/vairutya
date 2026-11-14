import { getLocale, getTranslations } from "next-intl/server";
import { BlogScrollCard } from "@/components/ui/BlogScrollCard";
import { HScroller } from "@/components/ui/HScroller";
import { getArticleCards } from "@/lib/content";

export default async function BlogListPage() {
  const t = await getTranslations("Home");
  const tb = await getTranslations("Blog");
  const posts = await getArticleCards(await getLocale());
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12 pb-24">
      <p className="mb-12 text-[15px] text-ink-muted">{tb("intro")}</p>
      <HScroller label={t("articleCount", { count: posts.length })}>
        {posts.map((post) => (
          <div key={post.id} className="w-[300px] shrink-0 snap-start sm:w-[340px]">
            <BlogScrollCard post={post} ctaLabel={t("readArticle")} />
          </div>
        ))}
      </HScroller>
    </div>
  );
}
