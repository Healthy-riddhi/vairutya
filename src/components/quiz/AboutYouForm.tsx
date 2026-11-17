"use client";

import { useEffect, useState, FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { scoreQuiz, type Quiz } from "@/lib/quiz/model";
import { QuizResults } from "./QuizResults";

const SELECTS = [
  { key: "ageGroup", label: "age", opts: "ages", placeholder: "select" },
  { key: "identity", label: "identity", opts: "identities", placeholder: "select" },
  { key: "country", label: "country", opts: "countries", placeholder: "selectCountry" },
  { key: "motivation", label: "motivation", opts: "motivations", placeholder: "select" },
] as const;

// The Hair quiz has its own option lists (age bands, identity and motivation wording).
const HAIR_OPTS: Record<string, string> = {
  ageGroup: "hairAges",
  identity: "hairIdentities",
  motivation: "motivations",
};

export function AboutYouForm({
  quiz,
  picks,
  answers,
  onClose,
}: {
  quiz: Quiz;
  picks: number[];
  answers: number[]; // the answer chosen for each question (position within the question)
  onClose: () => void;
}) {
  const t = useTranslations("Quiz");
  const locale = useLocale();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false); // newsletter: optional, never pre-ticked

  // Signed-in customers: fill in their name and email so they don't retype them.
  // Only empty fields are filled, so nothing the person has already typed is overwritten.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const user = d?.user;
        if (cancelled || !user) return;
        const first = String(user.fullName ?? "").trim().split(/\s+/)[0] ?? "";
        if (first) setFirstName((v) => v || first);
        if (user.email) setEmail((v) => v || String(user.email));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    // The team gets an email with their details, result and answers. Never delays or blocks the results.
    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        slug: quiz.slug,
        locale,
        answers,
        firstName,
        email,
        ageGroup: values.ageGroup ?? "",
        identity: values.identity ?? "",
        country: values.country ?? "",
        motivation: values.motivation ?? "",
        newsletter: consent,
      }),
    }).catch(() => {});
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
          const isHair = quiz.slug === "hair-dosha";
          const options = Object.values(t.raw(isHair ? HAIR_OPTS[key] ?? opts : opts) as Record<string, string>);
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
        <p className="text-center text-[12px] leading-relaxed text-ink-muted">{t("shareNote")}</p>
      </form>
    </div>
  );
}
