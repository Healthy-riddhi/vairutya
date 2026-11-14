import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { RichBlock } from "@/components/ui/RichText";
import { getArticleBySlug } from "@/lib/content";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug, await getLocale());

  if (!article) notFound();

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[280px] overflow-hidden sm:h-[320px]">
        <Image
          src={article.heroImage}
          alt={article.title}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 max-w-[760px] px-6 py-8 text-white sm:px-10">
          <span className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#b6ecf6]">
            {article.category}
          </span>
          <h1 className="font-serif text-2xl font-medium leading-tight sm:text-[38px]">
            {article.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[720px] px-6 py-14 pb-24">
        {article.sections.map((section, i) => (
          <div key={i} className="mb-9">
            {section.heading && (
              <h2 className="mb-4 font-serif text-2xl font-medium leading-snug text-teal">
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((block, j) => (
              <RichBlock key={j} text={block} />
            ))}
            {section.image && (
              <figure className="my-8">
                <Image
                  src={section.image.src}
                  alt={section.image.alt}
                  width={section.image.width}
                  height={section.image.height}
                  sizes="(min-width: 768px) 720px, 100vw"
                  className="h-auto w-full rounded-2xl"
                />
                {section.caption && (
                  <figcaption className="mt-3 text-center text-[13px] italic leading-relaxed text-ink-muted">
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        ))}

        {(article.ctaTitle || article.ctaBody) && (
          <div className="mt-12 rounded-r-xl border-l-4 border-teal bg-teal/[0.06] px-8 py-7">
            <p className="mb-2.5 font-serif text-xl font-medium italic text-teal">
              {article.ctaTitle}
            </p>
            <p className="mb-5 text-sm leading-relaxed text-ink-muted">
              {article.ctaBody}
            </p>
            {article.ctaHref && article.ctaButton && (
              <Link
                href={article.ctaHref}
                className="btn-primary inline-block !rounded-full"
              >
                {article.ctaButton}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
