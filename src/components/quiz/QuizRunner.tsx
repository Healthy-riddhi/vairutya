"use client";

import { useEffect, useRef, useState } from "react";
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
  const isLast = step === total - 1;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => clearTimer, []);

  // Picking an answer moves on by itself after a beat, so the choice is seen first.
  // The last question waits for Submit, so a stray tap can't send the quiz.
  function pick(i: number) {
    setSelected((prev) => {
      const next = [...prev];
      next[step] = i;
      return next;
    });
    if (isLast) return;
    clearTimer();
    const from = step;
    timer.current = setTimeout(() => setStep((s) => (s === from ? from + 1 : s)), 250);
  }

  function back() {
    clearTimer();
    setStep((s) => Math.max(0, s - 1));
  }

  const canSubmit = selected[step] !== null;

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

      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            className="cursor-pointer rounded-sm border border-line px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-teal/50"
          >
            {t("previous")}
          </button>
        ) : (
          <span />
        )}
        {isLast && (
          <button
            type="button"
            onClick={() => setDone(true)}
            disabled={!canSubmit}
            className={`rounded-sm px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors ${
              canSubmit ? "bg-teal cursor-pointer" : "bg-line cursor-default"
            }`}
          >
            {t("submit")}
          </button>
        )}
      </div>
    </div>
  );
}
