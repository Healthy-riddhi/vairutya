import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { pickResult, type Quiz, type QuizScore } from "@/lib/quiz/model";

// Last resort when neither the result nor the outcome has suggested products.
const DEFAULT_PRODUCTS = [
  { name: "Personalised consultation", description: "A 1-on-1 session that turns your result into a plan made for you.", buttonLabel: "Book now", link: "/consultation", highlighted: true },
  { name: "Shop the essentials", description: "Handcrafted tools and essentials rooted in Ayurveda.", buttonLabel: "Shop now", link: "/shop", highlighted: false },
  { name: "Take another quiz", description: "Explore another part of your constitution.", buttonLabel: "Explore", link: "/quiz", highlighted: false },
].map((p) => ({ ...p, image: null as string | null }));

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=320&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=320&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=320&fit=crop&auto=format",
];

/** One line per bullet; "Label: text" gets a bold label. A single plain line is a paragraph. */
function Lines({ body }: { body: string }) {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  const labelled = (l: string) => /^[^:]{1,40}:\s+\S/.test(l);
  if (lines.length === 1 && !labelled(lines[0])) {
    return <p className="text-sm leading-relaxed text-ink">{lines[0]}</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {lines.map((l, i) => {
        const m = /^([^:]{1,40}):\s+(.*)$/.exec(l);
        return (
          <li key={i} className="text-sm leading-relaxed text-ink">
            {m ? (
              <>
                <strong>{m[1]}:</strong> {m[2]}
              </>
            ) : (
              l
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function QuizResults({ quiz, score, onRetake }: { quiz: Quiz; score: QuizScore; onRetake: () => void }) {
  const t = useTranslations("Quiz");
  const d = quiz.outcomes[score.winner];
  const result = pickResult(quiz, score);
  const products = result?.products.length ? result.products : d.products.length ? d.products : DEFAULT_PRODUCTS;

  return (
    <div className="w-full max-w-[560px]">
      <div className="rounded-2xl border border-line bg-white p-7">
        <h2 className="mb-5 text-center font-serif text-[26px] font-medium text-ink">{quiz.resultTitle}</h2>

        <p className="mb-4 font-display text-lg font-bold" style={{ color: d.color }}>
          {result ? result.headline : `${d.emoji} ${quiz.resultTitle}: ${d.name}`}
        </p>

        <div className="mb-6 flex flex-col gap-4 rounded-[10px] border border-line bg-[#fdf9f4] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink">{quiz.profileTitle}</span>
            <ChevronDown size={18} strokeWidth={2} className="text-ink-muted" />
          </div>

          {result ? (
            <>
              {result.description &&
                result.description.split(/\n{2,}/).map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-ink">
                    {p}
                  </p>
                ))}
              {result.sections.map((s, i) => (
                <div key={i}>
                  {s.heading && (
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{s.heading}</p>
                  )}
                  <Lines body={s.body} />
                </div>
              ))}
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-ink">
                <strong>{d.headline}</strong>
                {d.description ? ` — ${d.description}` : ""}
              </p>
              {d.tips && <p className="text-sm leading-relaxed text-ink-muted">🪔 {d.tips}</p>}
            </>
          )}
        </div>

        <p className="mb-3.5 font-display text-[15px] font-bold text-ink">{quiz.balanceTitle}</p>
        <div className="mb-6 flex flex-col gap-2.5">
          {quiz.outcomes.map((o, i) => (
            <div key={o.name} className="flex items-center gap-3">
              <span className="w-12 shrink-0 text-[13px] text-ink">{o.name}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#eee]">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${score.percents[i]}%`, backgroundColor: o.color }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-[13px] text-ink-muted">{score.percents[i]}%</span>
            </div>
          ))}
        </div>

        <p className="mb-3.5 font-display text-[15px] font-bold text-ink">{t("suggested")}</p>
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {products.map((p, i) => (
            <div key={`${p.name}-${i}`} className="flex flex-col overflow-hidden rounded-[10px] border border-line">
              <div className="relative aspect-[16/9] w-full sm:aspect-square">
                <Image
                  src={p.image ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                  alt={p.name}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-2.5 pb-3.5">
                <p className="text-[12px] font-bold leading-snug text-[#b8862a]">{p.name}</p>
                <p className="flex-1 text-[11px] leading-snug text-ink-muted">{p.description}</p>
                <Link
                  href={p.link}
                  className={`mt-1.5 block rounded-full border border-ink py-2 text-center text-[10px] font-bold uppercase tracking-[0.1em] ${
                    p.highlighted ? "bg-ink text-white" : "bg-transparent text-ink"
                  }`}
                >
                  {p.buttonLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <p className="mb-6 text-center text-xs leading-relaxed text-ink-muted">{t("disclaimer")}</p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={onRetake}
            className="rounded-full border border-ink px-10 py-3.5 text-xs font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-white"
          >
            {t("retake")}
          </button>
        </div>
      </div>
    </div>
  );
}
