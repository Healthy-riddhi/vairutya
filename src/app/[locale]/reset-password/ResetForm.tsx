"use client";

import { useState, FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

export function ResetForm({ code }: { code: string }) {
  const t = useTranslations("Auth");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [badLink, setBadLink] = useState(!code);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (password !== confirm) {
      setError(t("mismatch"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === "invalid_code") setBadLink(true);
        throw new Error(data.error ?? t("generic"));
      }
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
              <CheckCircle2 size={32} strokeWidth={1.75} className="text-teal" />
            </div>
            <h1 className="mb-3 font-serif text-[26px] font-medium text-ink">{t("updated")}</h1>
            <p className="mb-6 text-sm leading-relaxed text-ink-muted">
              {t("canSignIn")}
            </p>
            <Link href="/login" className="btn-primary inline-block !rounded-[10px]">
              {t("signIn")}
            </Link>
          </div>
        ) : badLink ? (
          <div className="text-center">
            <h1 className="mb-3 font-serif text-[26px] font-medium text-ink">
              {t("expired")}
            </h1>
            <p className="mb-6 text-sm leading-relaxed text-ink-muted">
              {t("expiredText")}
            </p>
            <Link href="/forgot-password" className="btn-primary inline-block !rounded-[10px]">
              {t("newLink")}
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-1.5 text-center font-serif text-[28px] font-medium text-ink">
              {t("choose")}
            </h1>
            <p className="mb-7 text-center text-sm text-ink-muted">
              {t("minChars")}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="password" className="mb-1.5 block text-[13px] font-semibold text-ink">
                  {t("newPass")}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    required
                    minLength={10}
                    maxLength={72}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field h-[52px] rounded-[10px] pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    aria-label={showPass ? t("hide") : t("show")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
                  >
                    {showPass ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-[13px] font-semibold text-ink">
                  {t("confirmPass")}
                </label>
                <input
                  id="confirm"
                  type={showPass ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="field h-[52px] rounded-[10px]"
                />
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
                {busy ? t("saving") : t("updatePass")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
