import { mediaUrl, strapiGet, type StrapiMedia } from "@/lib/strapi";
import type { Quiz, QuizAnswer, QuizOutcome, QuizProduct, QuizQuestion, QuizResult } from "./model";

type RawQuiz = {
  slug: string;
  title?: string;
  description?: string | null;
  icon?: string | null;
  resultTitle?: string | null;
  profileTitle?: string | null;
  balanceTitle?: string | null;
  instructions?: string | null;
  results?: {
    matches?: string | null;
    headline?: string | null;
    description?: string | null;
    sections?: { heading?: string | null; body?: string | null }[];
    products?: {
      name?: string | null;
      description?: string | null;
      buttonLabel?: string | null;
      link?: string | null;
      image?: StrapiMedia | null;
      highlighted?: boolean | null;
    }[];
  }[];
  questions?: { prompt?: string | null; answers?: { text?: string | null; outcomeName?: string | null }[] }[];
  outcomes?: {
    name?: string | null;
    headline?: string | null;
    emoji?: string | null;
    color?: string | null;
    description?: string | null;
    tips?: string | null;
    products?: {
      name?: string | null;
      description?: string | null;
      buttonLabel?: string | null;
      link?: string | null;
      image?: StrapiMedia | null;
      highlighted?: boolean | null;
    }[];
  }[];
};

const COLORS = ["#7ca9d4", "#e07b3a", "#6aab7e", "#b8862a", "#9b6fb0"];

function mapQuiz(r: RawQuiz): Quiz | null {
  const outcomes: QuizOutcome[] = (r.outcomes ?? [])
    .filter((o) => o.name?.trim())
    .map((o, i) => ({
      name: o.name!.trim(),
      headline: o.headline?.trim() || o.name!.trim(),
      emoji: o.emoji ?? "",
      color: o.color || COLORS[i % COLORS.length],
      description: o.description ?? "",
      tips: o.tips ?? "",
      products: (o.products ?? [])
        .filter((p) => p.name?.trim())
        .map((p) => ({
          name: p.name!.trim(),
          description: p.description ?? "",
          buttonLabel: p.buttonLabel || "Learn More",
          link: p.link || "/shop",
          image: mediaUrl(p.image),
          highlighted: Boolean(p.highlighted),
        })),
    }));
  if (outcomes.length < 2) return null;

  const index = new Map(outcomes.map((o, i) => [o.name.toLowerCase(), i]));
  const questions: QuizQuestion[] = (r.questions ?? [])
    .map((q) => {
      const answers: QuizAnswer[] = [];
      for (const a of q.answers ?? []) {
        const outcome = index.get((a.outcomeName ?? "").trim().toLowerCase());
        if (a.text?.trim() && outcome !== undefined) answers.push({ text: a.text.trim(), outcome });
      }
      return { prompt: q.prompt?.trim() ?? "", answers };
    })
    .filter((q) => q.prompt && q.answers.length >= 2);
  if (questions.length === 0) return null;

  const results: QuizResult[] = (r.results ?? [])
    .filter((x) => x.matches?.trim() && x.headline?.trim())
    .map((x) => ({
      key: x.matches!.split("+").map((s) => s.trim().toLowerCase()).filter(Boolean).sort().join("+"),
      headline: x.headline!.trim(),
      description: x.description ?? "",
      sections: (x.sections ?? [])
        .filter((s) => s.body?.trim())
        .map((s) => ({ heading: s.heading?.trim() ?? "", body: s.body!.trim() })),
      products: (x.products ?? [])
        .filter((p) => p.name?.trim())
        .map(
          (p): QuizProduct => ({
            name: p.name!.trim(),
            description: p.description ?? "",
            buttonLabel: p.buttonLabel || "Learn More",
            link: p.link || "/shop",
            image: mediaUrl(p.image),
            highlighted: Boolean(p.highlighted),
          })
        ),
    }));

  return {
    slug: r.slug,
    title: r.title ?? r.slug,
    description: r.description ?? "",
    icon: r.icon ?? "help",
    resultTitle: r.resultTitle || "Your Result",
    profileTitle: r.profileTitle || "Your Profile",
    balanceTitle: r.balanceTitle || "Your Balance",
    instructions: r.instructions ?? "",
    questions,
    outcomes,
    results,
  };
}

/** Published quizzes, oldest first. Incomplete quizzes are left out. */
async function fetchRaw(locale: string): Promise<RawQuiz[]> {
  const query = [
    `locale=${locale}`,
    "sort[0]=createdAt:asc",
    "pagination[pageSize]=100",
    "populate[questions][populate][answers]=true",
    "populate[outcomes][populate][products][populate][image]=true",
    "populate[results][populate][sections]=true",
    "populate[results][populate][products][populate][image]=true",
  ].join("&");
  return (await strapiGet<{ data: RawQuiz[] }>("quizzes", query)).data;
}

/** English is the base; a French quiz with the same slug replaces it. */
export async function getQuizzes(locale = "en"): Promise<Quiz[]> {
  const base = await fetchRaw("en");
  let raws = base;
  if (locale !== "en") {
    const tr = await fetchRaw(locale).catch(() => [] as RawQuiz[]);
    const bySlug = new Map(tr.map((q) => [q.slug, q]));
    raws = base.map((b) => bySlug.get(b.slug) ?? b);
  }
  return raws.map(mapQuiz).filter((q): q is Quiz => q !== null);
}

export async function getQuizBySlug(slug: string, locale = "en") {
  return (await getQuizzes(locale)).find((q) => q.slug === slug);
}
