"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";

export function NewsletterLargeForm() {
  const t = useTranslations("Newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage-newsletter" }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="bg-stone px-6 py-16 text-center sm:px-12">
        <h2 className="font-display text-3xl text-teal sm:text-4xl">{t("title")}</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">{t("text")}</p>

        {status === "done" ? (
          <p className="mt-8 text-teal font-medium">{t("success")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="hp-newsletter-email" className="sr-only">
              {t("emailLabel")}
            </label>
            <input
              id="hp-newsletter-email"
              type="email"
              required
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field flex-1 bg-cream"
            />
            <button type="submit" disabled={status === "loading"} className="btn-primary shrink-0">
              {status === "loading" ? t("subscribing") : t("subscribe")}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="mt-3 text-sm text-clay" role="alert">
            {t("error")}
          </p>
        )}

        <p className="mt-4 text-xs text-ink-muted">{t("privacy")}</p>
      </div>
    </section>
  );
}
