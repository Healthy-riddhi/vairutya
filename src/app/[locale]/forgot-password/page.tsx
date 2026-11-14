"use client";

import { useState, FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? t("generic"));
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generic"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-[440px] rounded-2xl border border-line/30 bg-white p-9 shadow-[0_8px_40px_rgba(0,0,0,0.06)] sm:p-10">
        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
              <Mail size={30} strokeWidth={1.75} className="text-teal" />
            </div>
            <h1 className="mb-3 font-serif text-[26px] font-medium text-ink">{t("checkInbox")}</h1>
            <p className="mb-6 text-sm leading-relaxed text-ink-muted">
              {t.rich("forgotDone", { email, b: (c) => <strong className="text-ink">{c}</strong> })}
            </p>
            <Link href="/login" className="text-[13px] font-semibold text-teal">
              {t("backToSignIn")}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-1.5 text-center font-serif text-[28px] font-medium text-ink">
              {t("forgotTitle")}
            </h1>
            <p className="mb-7 text-center text-sm text-ink-muted">
              {t("forgotIntro")}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold text-ink">
                  {t("email")}
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field h-[52px] rounded-[10px] pr-11"
                  />
                  <Mail
                    size={18}
                    strokeWidth={1.75}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
                  />
                </div>
              </div>
              {error && (
                <p role="alert" className="text-[13px] text-clay">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="btn-primary h-[52px] w-full !rounded-[10px] disabled:opacity-60"
              >
                {busy ? t("sending") : t("sendLink")}
              </button>
            </form>
            <p className="mt-5 text-center text-[13px] text-ink-muted">
              <Link href="/login" className="font-semibold text-teal">
                {t("backToSignIn")}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
