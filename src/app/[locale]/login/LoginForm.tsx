"use client";

import { useState, FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { User, Mail, Eye, EyeOff, CheckCircle2 } from "lucide-react";

type Mode = "login" | "signup";

async function call(action: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/auth/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export function LoginForm({ next, justConfirmed }: { next: string; justConfirmed: boolean }) {
  const router = useRouter();
  const t = useTranslations("Auth");

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null); // "check your inbox" screen
  const [resent, setResent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setUnconfirmed(false);

    const { ok, data } =
      mode === "login"
        ? await call("login", { email, password })
        : await call("register", { email, password, fullName: name });

    setBusy(false);

    if (!ok) {
      setError(data.error ?? t("generic"));
      setUnconfirmed(data.code === "unconfirmed");
      return;
    }
    if (mode === "signup" && data.needsConfirmation) {
      setSentTo(email);
      return;
    }
    // Signed in: go where they were headed, and refresh so the header updates.
    router.push(next);
    router.refresh();
  }

  async function resend(to: string) {
    await call("resend-confirmation", { email: to });
    setResent(true);
  }

  /* ---------- "check your inbox" ---------- */
  if (sentTo) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 py-16">
        <div className="w-full max-w-[440px] rounded-2xl border border-line/30 bg-white p-9 text-center shadow-[0_8px_40px_rgba(0,0,0,0.06)] sm:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10">
            <Mail size={30} strokeWidth={1.75} className="text-teal" />
          </div>
          <h1 className="mb-3 font-serif text-[26px] font-medium text-ink">
            {t("checkInbox")}
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-ink-muted">
            {t.rich("sentTo", { email: sentTo, b: (c) => <strong className="text-ink">{c}</strong> })}
          </p>
          <button
            type="button"
            onClick={() => resend(sentTo)}
            disabled={resent}
            className="py-2 text-[13px] font-semibold text-teal disabled:text-ink-muted"
          >
            {resent ? t("sentAgainInbox") : t("sendEmailAgain")}
          </button>
          <p className="mt-6 text-[13px] text-ink-muted">
            <button
              type="button"
              onClick={() => {
                setSentTo(null);
                setMode("login");
              }}
              className="font-semibold text-teal"
            >
              {t("backToSignIn")}
            </button>
          </p>
        </div>
      </div>
    );
  }

  /* ---------- sign in / create account ---------- */
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-5 py-16">
      <div className="w-full max-w-[440px] rounded-2xl border border-line/30 bg-white p-9 shadow-[0_8px_40px_rgba(0,0,0,0.06)] sm:p-10">
        <h1 className="mb-1.5 text-center font-serif text-[28px] font-medium text-ink">
          {mode === "login" ? t("signIn") : t("createAccount")}
        </h1>
        <p className="mb-7 text-center text-sm text-ink-muted">
          {mode === "login"
            ? t("welcomeBack")
            : t("startJourney")}
        </p>

        {justConfirmed && mode === "login" && (
          <div
            role="status"
            className="mb-5 flex items-start gap-2.5 rounded-[10px] bg-teal/[0.07] px-4 py-3 text-[13px] text-teal"
          >
            <CheckCircle2 size={18} strokeWidth={1.75} className="mt-px shrink-0" />
            <span>{t("confirmed")}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-[13px] font-semibold text-ink">
                {t("fullName")}
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  required
                  autoComplete="name"
                  maxLength={80}
                  placeholder={t("namePh")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="field h-[52px] rounded-[10px] pr-11"
                />
                <User
                  size={18}
                  strokeWidth={1.75}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
                />
              </div>
            </div>
          )}

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

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-[13px] font-semibold text-ink">
                {t("password")}
              </label>
              {mode === "login" && (
                <Link href="/forgot-password" className="inline-block -my-2 py-2 text-xs font-semibold text-teal">
                  {t("forgot")}
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                required
                minLength={mode === "signup" ? 10 : undefined}
                maxLength={72}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field h-[52px] rounded-[10px] pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? t("hide") : t("show")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 text-ink-muted"
              >
                {showPass ? (
                  <EyeOff size={18} strokeWidth={1.75} />
                ) : (
                  <Eye size={18} strokeWidth={1.75} />
                )}
              </button>
            </div>
            {mode === "signup" && (
              <p className="mt-1.5 text-xs text-ink-muted">
                {t("minChars")}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="text-[13px] text-clay">
              {error}
              {unconfirmed && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={() => resend(email)}
                    className="font-semibold underline"
                  >
                    {resent ? t("sentAgain") : t("sendAgain")}
                  </button>
                </>
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-primary mt-2 h-[52px] w-full !rounded-[10px] disabled:opacity-60"
          >
            {busy
              ? t("wait")
              : mode === "login"
                ? t("signInBtn")
                : t("createBtn")}
          </button>

          {mode === "signup" && (
            <p className="text-center text-xs leading-relaxed text-ink-muted">
              {t.rich("agree", {
                terms: (c) => <Link href="/terms" className="underline">{c}</Link>,
                privacy: (c) => <Link href="/privacy" className="underline">{c}</Link>,
              })}
            </p>
          )}
        </form>

        <p className="mt-5 text-center text-[13px] text-ink-muted">
          {(mode === "login" ? t("noAccount") : t("haveAccount")) + " "}
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "login" ? "signup" : "login"));
              setError("");
              setUnconfirmed(false);
            }}
            className="inline-block -my-2 py-2 font-semibold text-teal"
          >
            {mode === "login" ? t("signUp") : t("signIn")}
          </button>
        </p>
      </div>
    </div>
  );
}
