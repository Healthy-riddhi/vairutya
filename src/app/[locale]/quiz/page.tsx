import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HelpCircle, Accessibility, Smile, Heart, Leaf, Sparkles, ArrowRight } from "lucide-react";
import { getQuizzes } from "@/lib/quiz/cms";
import type { Quiz } from "@/lib/quiz/model";

const ICONS = { help: HelpCircle, body: Accessibility, skin: Smile, heart: Heart, leaf: Leaf, sparkles: Sparkles } as const;

export async function generateMetadata() {
  const t = await getTranslations("Quiz");
  return { title: t("metaTitle") };
}

export default async function QuizListPage() {
  const t = await getTranslations("Quiz");
  let quizzes: Quiz[] = [];
  try {
    quizzes = await getQuizzes(await getLocale());
  } catch (err) {
    console.error("[quiz] could not load quizzes:", err);
  }

  return (
    <div className="mx-auto max-w-[860px] px-6 py-12 pb-20">
      <div className="mb-12">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">VAIRUTYA</p>
        <h1 className="mb-4 font-serif text-[32px] font-normal leading-tight text-ink sm:text-[48px]">{t("listTitle")}</h1>
        <div className="mb-5 h-0.5 w-12 bg-teal" />
        <p className="max-w-[540px] text-[15px] leading-relaxed text-ink-muted">{t("listIntro")}</p>
      </div>

      {quizzes.length === 0 ? (
        <p className="text-center text-ink-muted">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {quizzes.map((q) => {
            const Icon = ICONS[q.icon as keyof typeof ICONS] ?? HelpCircle;
            return (
              <Link
                key={q.slug}
                href={`/quiz/${q.slug}`}
                className="flex flex-col gap-3.5 rounded-sm border border-line/30 bg-white p-7 pb-6 transition-shadow hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]"
              >
                <Icon size={28} strokeWidth={1.75} className="text-teal" />
                <div>
                  <p className="mb-2 font-display text-base font-bold text-ink">{q.title}</p>
                  <p className="text-sm leading-relaxed text-ink-muted">{q.description}</p>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-teal">
                  <span className="text-xs font-semibold uppercase tracking-[0.08em]">{t("start")}</span>
                  <ArrowRight size={16} strokeWidth={2} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
