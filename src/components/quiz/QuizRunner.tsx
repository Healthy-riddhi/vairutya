"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Quiz } from "@/lib/quiz/model";
import { AboutYouForm } from "./AboutYouForm";

export function QuizRunner({ quiz, onClose }: { quiz: Quiz; onClose: () => void }) {
  const t = useTranslations("Quiz");
  const total = quiz.questions.length;
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<(number | null)[]>(() => Array(total).fill(null));
  const [done, setDone] = useState(false);

  const q = quiz.questions[step];

  function pick(i: number) {
    setSelected((prev) => {
      const next = [...prev];
      next[step] = i;
      return next;
    });
  }

  function next() {
    if (step < total - 1) setStep((s) => s + 1);
    else setDone(true);
  }

  const canAdvance = selected[step] !== null;

  if (done) {
    const picks = selected.map((a, qi) => quiz.questions[qi].answers[a as number].outcome);
    return <AboutYouForm quiz={quiz} picks={picks} onClose={onClose} />;
  }

  return (
    <div className="w-full max-w-[620px]">
      <div className="mb-8 text-center">
        <span className="text-[13px] font-bold tracking-[0.05em] text-ink-muted">
          {t("question", { n: step + 1, total })}
        </span>
        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-teal transition-[width] duration-400 ease-out"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && quiz.instructions && (
        <p className="mb-6 text-center text-sm italic leading-relaxed text-ink-muted">{quiz.instructions}</p>
      )}

      <h2 className="mb-8 text-center font-display text-2xl font-bold leading-snug text-ink sm:text-[26px]">
        {q.prompt}
      </h2>

      <div className="mb-8 flex flex-col gap-3.5">
        {q.answers.map((a, i) => {
          const isSelected = selected[step] === i;
          return (
            <button
              key={`${step}-${i}`}
              type="button"
              onClick={() => pick(i)}
              className={`w-full rounded-xl border-[1.5px] px-6 py-4.5 text-left text-base transition-all ${
                isSelected
                  ? "border-teal bg-teal/5 text-teal"
                  : "border-line bg-white text-ink hover:border-teal/50"
              }`}
            >
              {String.fromCharCode(65 + i)}) {a.text}
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance}
          className={`rounded-sm px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors ${
            canAdvance ? "bg-teal cursor-pointer" : "bg-line cursor-default"
          }`}
        >
          {step < total - 1 ? t("next") : t("submit")}
        </button>
      </div>
    </div>
  );
}
