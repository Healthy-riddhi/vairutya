"use client";

import { useState, FormEvent } from "react";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Recipe } from "@/types/content";

export function RecipeDetailClient({ recipe }: { recipe: Recipe }) {
  const t = useTranslations("Recipes");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false); // newsletter: optional, never pre-ticked
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/recipe-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          slug: recipe.slug,
          newsletter: consent,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("generic"));
      }
      setStatus("done");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : t("generic")
      );
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-8 py-10 pb-20">
      <h1 className="mb-9 font-display text-[22px] font-bold leading-tight text-ink">
        {recipe.title}
      </h1>

      <div className="mb-12 text-center">
        {recipe.stats.map((s, i) => (
          <p
            key={i}
            className={`mb-1.5 text-[15px] tracking-[0.15em] text-ink ${
              s.bold ? "font-bold" : "font-normal"
            }`}
          >
            {s.label}
          </p>
        ))}
      </div>

      {status === "done" ? (
        <div className="rounded-2xl border border-line/20 bg-white p-8 text-center">
          <Download size={36} strokeWidth={1.75} className="mx-auto mb-3 text-teal" />
          <p className="font-serif text-xl font-medium text-teal">
            {t("done")}
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            {t("doneText", { email })}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-5 font-serif text-[22px] font-normal text-ink">
            {t("downloadIntro")}
          </p>
          <form
            onSubmit={handleSubmit}
            className="mb-3 flex flex-wrap gap-2.5"
          >
            <input
              type="text"
              required
              placeholder={t("name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field h-11 min-w-[140px] flex-1 rounded-sm"
            />
            <input
              type="email"
              required
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field h-11 min-w-[140px] flex-1 rounded-sm"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary h-11 shrink-0 whitespace-nowrap !px-7 !py-0"
            >
              {status === "loading" ? "..." : t("download")}
            </button>
          </form>
          {status === "error" && (
            <p role="alert" className="mb-3 text-sm text-clay">
              {errorMsg}
            </p>
          )}
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="h-4 w-4 accent-teal"
            />
            <span className="text-[13px] text-ink-muted">
              {t("consent")}
            </span>
          </label>
        </>
      )}
    </div>
  );
}
