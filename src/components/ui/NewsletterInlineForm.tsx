"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";

export function NewsletterInlineForm({ className = "" }: { className?: string }) {
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
        body: JSON.stringify({ email, source: "footer" }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className={`text-sm text-teal ${className}`}>{t("success")}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={`flex ${className}`}>
      <label htmlFor="footer-email" className="sr-only">
        {t("emailLabel")}
      </label>
      <input
        id="footer-email"
        type="email"
        required
        placeholder={t("emailLabel")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full min-w-0 border border-line bg-cream px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-teal outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 bg-teal px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-cream hover:bg-teal-light transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "..." : t("join")}
      </button>
      {status === "error" && (
        <p className="sr-only" role="alert">
          {t("error")}
        </p>
      )}
    </form>
  );
}
