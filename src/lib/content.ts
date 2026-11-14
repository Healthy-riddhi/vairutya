/**
 * Recipes, blog articles and workshops — loaded from Strapi.
 * Pages re-check Strapi at most once a minute (see strapiGet).
 */
import type {
  Article,
  BlogPost,
  ConsultationContent,
  Recipe,
  WorkshopFull,
} from "@/types/content";
import { mediaUrl, strapiGet, StrapiError, StrapiMedia } from "@/lib/strapi";

type Line = { text: string };

/** Long text from Strapi: paragraphs are separated by a blank line. */
const paragraphs = (text?: string | null) =>
  (text ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

const lines = (items?: Line[]) => (items ?? []).map((l) => l.text);

const PLACEHOLDER = "https://picsum.photos/seed/vairutya/1200/700";

const filled = (v: unknown) =>
  v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0);

/**
 * English is the base. For another language, each translated entry replaces its English
 * twin field by field; anything left empty falls back to English. Order follows English.
 */
async function fetchMerged<T extends { documentId: string }>(
  path: string,
  query: string,
  locale: string
): Promise<T[]> {
  const base = (await strapiGet<{ data: T[] }>(path, query.replace(`locale=${locale}`, "locale=en"))).data;
  if (locale === "en") return base;
  const tr = await strapiGet<{ data: T[] }>(path, query).then((r) => r.data).catch(() => [] as T[]);
  const byDoc = new Map(tr.map((x) => [x.documentId, x]));
  return base.map((b) => {
    const t = byDoc.get(b.documentId);
    if (!t) return b;
    const out: Record<string, unknown> = { ...b };
    for (const [k, v] of Object.entries(t)) if (filled(v)) out[k] = v;
    return out as T;
  });
}

/* ------------------------------------------------------------------ */
/* Recipes                                                             */
/* ------------------------------------------------------------------ */

type StrapiRecipe = {
  documentId: string;
  title: string;
  slug: string;
  tag?: string;
  description?: string;
  time?: string;
  image?: StrapiMedia | null;
  stats?: { label: string; bold?: boolean }[];
  pdf?: StrapiMedia | null;
};

export async function getRecipes(locale = "en"): Promise<Recipe[]> {
  const query = [
    `locale=${locale}`,
    "sort[0]=createdAt:asc", // book order = the order you created them
    "pagination[pageSize]=100",
    "populate[image]=true",
    "populate[stats]=true",
    "populate[pdf]=true",
  ].join("&");
  const data = await fetchMerged<StrapiRecipe>("recipes", query, locale);
  return data.map((r) => ({
    slug: r.slug,
    title: r.title,
    tag: r.tag ?? "",
    description: r.description ?? "",
    time: r.time ?? "",
    image: mediaUrl(r.image) ?? PLACEHOLDER,
    stats: (r.stats ?? []).map((s) => ({ label: s.label, bold: s.bold })),
    pdfUrl: mediaUrl(r.pdf) ?? undefined,
  }));
}

export async function getRecipeBySlug(slug: string, locale = "en") {
  return (await getRecipes(locale)).find((r) => r.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Blog articles                                                       */
/* ------------------------------------------------------------------ */

type StrapiArticle = {
  documentId: string;
  title: string;
  slug: string;
  category?: string;
  excerpt?: string;
  heroImage?: StrapiMedia | null;
  sections?: {
    heading?: string | null;
    body?: string | null;
    image?: StrapiMedia | null;
    caption?: string | null;
  }[];
  ctaTitle?: string;
  ctaBody?: string;
  ctaButton?: string;
  ctaHref?: string | null;
};

async function fetchArticles(locale: string): Promise<StrapiArticle[]> {
  const query = [
    `locale=${locale}`,
    "sort[0]=createdAt:desc", // newest first
    "pagination[pageSize]=100",
    "populate[heroImage]=true",
    "populate[sections][populate]=image",
  ].join("&");
  const data = await fetchMerged<StrapiArticle>("articles", query, locale);
  return data;
}

/** Cards for the blog list and the homepage. */
export async function getArticleCards(locale = "en"): Promise<BlogPost[]> {
  return (await fetchArticles(locale)).map((a) => ({
    id: a.documentId,
    slug: a.slug,
    category: a.category ?? "",
    title: a.title,
    excerpt: a.excerpt ?? "",
    image: mediaUrl(a.heroImage) ?? PLACEHOLDER,
  }));
}

export async function getArticleBySlug(
  slug: string,
  locale = "en"
): Promise<Article | undefined> {
  const a = (await fetchArticles(locale)).find((x) => x.slug === slug);
  if (!a) return undefined;
  return {
    slug: a.slug,
    category: a.category ?? "",
    title: a.title,
    heroImage: mediaUrl(a.heroImage) ?? PLACEHOLDER,
    sections: (a.sections ?? []).map((s) => {
      const src = mediaUrl(s.image);
      return {
        heading: s.heading ?? undefined,
        paragraphs: paragraphs(s.body),
        image:
          src && s.image
            ? {
                src,
                width: s.image.width ?? 1200,
                height: s.image.height ?? 800,
                alt: s.image.alternativeText ?? s.caption ?? "",
              }
            : undefined,
        caption: s.caption ?? undefined,
      };
    }),
    ctaTitle: a.ctaTitle ?? "",
    ctaBody: a.ctaBody ?? "",
    ctaButton: a.ctaButton ?? "",
    ctaHref: a.ctaHref ?? undefined,
  };
}

/* ------------------------------------------------------------------ */
/* Workshops                                                           */
/* ------------------------------------------------------------------ */

type StrapiWorkshop = {
  documentId: string;
  title: string;
  slug: string;
  category?: string;
  description?: string;
  heroImage?: StrapiMedia | null;
  schedule?: string;
  ctaLabel?: string;
  durationLabel?: string;
  priceLabel?: string;
  about?: string;
  menu?: Line[];
  notes?: Line[];
  dates?: { label: string; value: string }[];
};

export async function getWorkshops(locale = "en"): Promise<WorkshopFull[]> {
  const query = [
    `locale=${locale}`,
    "sort[0]=createdAt:asc",
    "pagination[pageSize]=100",
    "populate[heroImage]=true",
    "populate[menu]=true",
    "populate[notes]=true",
    "populate[dates]=true",
  ].join("&");
  const data = await fetchMerged<StrapiWorkshop>("workshops", query, locale);
  return data.map((w) => {
    const dates = (w.dates ?? []).map(({ label, value }) => ({ label, value }));
    return {
      id: w.documentId,
      slug: w.slug,
      category: w.category ?? "Workshop",
      listTag: w.category ?? "Workshop",
      title: w.title,
      description: w.description ?? "",
      heroImage: mediaUrl(w.heroImage) ?? PLACEHOLDER,
      durationLabel: w.durationLabel ?? "",
      priceLabel: w.priceLabel ?? "",
      about: paragraphs(w.about),
      menu: w.menu?.length ? lines(w.menu) : undefined,
      notes: w.notes?.length ? lines(w.notes) : undefined,
      dates,
      schedule: w.schedule ?? dates[0]?.label ?? "",
      ctaLabel: w.ctaLabel ?? "Register Now",
    };
  });
}

export async function getWorkshopBySlug(slug: string, locale = "en") {
  return (await getWorkshops(locale)).find((w) => w.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Consultation page                                                   */
/* ------------------------------------------------------------------ */

type StrapiConsultation = {
  headline: string;
  intro?: string;
  primaryCta?: string;
  helpTitle?: string;
  helpBody?: string;
  journeyTitle?: string;
  journeySteps?: { title: string; description: string }[];
  includedTitle?: string;
  includedIntro?: string;
  includedItems?: { title: string; description: string }[];
  closingTitle?: string;
  closingBody?: string;
  secondaryCta?: string;
};

/** The page copy, or null if it hasn't been published in Strapi yet. */
export async function getConsultationPage(
  locale = "en"
): Promise<ConsultationContent | null> {
  const query = [
    `locale=${locale}`,
    "populate[journeySteps]=true",
    "populate[includedItems]=true",
  ].join("&");

  try {
    const { data: c } = await strapiGet<{ data: StrapiConsultation }>(
      "consultation-page",
      query
    );
    return {
      headline: c.headline,
      intro: c.intro ?? "",
      primaryCta: c.primaryCta ?? "Book Your Consultation",
      helpTitle: c.helpTitle ?? "",
      helpParagraphs: paragraphs(c.helpBody),
      journeyTitle: c.journeyTitle ?? "",
      journeySteps: (c.journeySteps ?? []).map(({ title, description }) => ({
        title,
        description,
      })),
      includedTitle: c.includedTitle ?? "",
      includedIntro: c.includedIntro ?? "",
      includedItems: (c.includedItems ?? []).map(({ title, description }) => ({
        title,
        description,
      })),
      closingTitle: c.closingTitle ?? "",
      closingBody: c.closingBody ?? "",
      secondaryCta: c.secondaryCta ?? "Secure Your Spot",
    };
  } catch (err) {
    if (err instanceof StrapiError && err.status === 404) return null;
    throw err;
  }
}
