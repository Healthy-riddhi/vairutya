"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { scoreQuiz, type Quiz } from "@/lib/quiz/model";
import { QuizResults } from "./QuizResults";

const SELECTS = [
  { key: "ageGroup", label: "age", opts: "ages", placeholder: "select" },
  { key: "identity", label: "identity", opts: "identities", placeholder: "select" },
  { key: "country", label: "country", opts: "countries", placeholder: "selectCountry" },
  { key: "motivation", label: "motivation", opts: "motivations", placeholder: "select" },
] as const;

export function AboutYouForm({ quiz, picks, onClose }: { quiz: Quiz; picks: number[]; onClose: () => void }) {
  const t = useTranslations("Quiz");
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false); // newsletter: optional, never pre-ticked

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    // Only people who tick the box are contacted, after a confirmation email (double opt-in).
    if (consent) {
      fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, source: "quiz" }),
      }).catch(() => {});
    }
  }

  if (submitted) {
    return <QuizResults quiz={quiz} score={scoreQuiz(quiz.outcomes.length, picks)} onRetake={onClose} />;
  }

  return (
    <div className="w-full max-w-[620px]">
      <h2 className="mb-9 text-center font-serif text-4xl font-medium tracking-[0.01em] text-ink">{t("aboutTitle")}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">{t("firstName")}</label>
          <input type="text" required placeholder={t("firstNamePh")} value={firstName} onChange={(e) => setFirstName(e.target.value)} className="field h-14 rounded-xl" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">{t("email")}</label>
          <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="field h-14 rounded-xl" />
        </div>

        {SELECTS.filter((s) => s.key !== "motivation" || quiz.slug === "hair-dosha").map(({ key, label, opts, placeholder }) => {
          const value = values[key] ?? "";
          const options = Object.values(t.raw(opts) as Record<string, string>);
          return (
            <div key={key}>
              <label className="mb-2 block text-sm font-semibold text-ink">{t(label)} *</label>
              <div className="relative">
                <select
                  required
                  value={value}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  className={`field h-14 appearance-none rounded-xl pr-10 ${value ? "text-ink" : "text-ink-muted"}`}
                >
                  <option value="" disabled>{t(placeholder)}</option>
                  {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <ChevronDown size={20} strokeWidth={2} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              </div>
            </div>
          );
        })}

        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-teal" />
          <span className="text-[13px] leading-relaxed text-ink-muted">{t("consent")}</span>
        </label>

        <div className="mt-2 flex justify-center">
          <button type="submit" className="rounded-full border-[1.5px] border-ink px-12 py-4 text-[13px] font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:border-teal hover:bg-teal hover:text-white">
            {t("results")}
          </button>
        </div>
      </form>
    </div>
  );
}
