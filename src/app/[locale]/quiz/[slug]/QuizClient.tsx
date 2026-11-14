"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { X } from "lucide-react";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import type { Quiz } from "@/lib/quiz/model";

export function QuizClient({ quiz }: { quiz: Quiz }) {
  const t = useTranslations("Quiz");
  const router = useRouter();
  const close = () => router.push("/quiz");

  return (
    <div className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 py-10">
      <button type="button" onClick={close} aria-label={t("close")} className="absolute right-3 top-2 p-3 text-ink-muted transition-colors hover:text-ink">
        <X size={28} strokeWidth={1.75} />
      </button>
      <QuizRunner quiz={quiz} onClose={close} />
    </div>
  );
}
