"use client";

import { useState, FormEvent, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  LayoutGrid, ShoppingBag, HelpCircle, Settings as SettingsIcon, CalendarDays, Star,
  Pencil, Bell, Lock, CircleHelp, Download, X,
} from "lucide-react";
import type { SessionUser } from "@/lib/session";

type Tab = "overview" | "orders" | "quizzes" | "settings";
type SettingKey = "profile" | "password" | "email" | "privacy" | "help";

const TABS: { key: Tab; icon: typeof LayoutGrid }[] = [
  { key: "overview", icon: LayoutGrid },
  { key: "orders", icon: ShoppingBag },
  { key: "quizzes", icon: HelpCircle },
  { key: "settings", icon: SettingsIcon },
];

const SETTINGS: { key: SettingKey; icon: typeof LayoutGrid }[] = [
  { key: "profile", icon: Pencil },
  { key: "password", icon: Lock },
  { key: "email", icon: Bell },
  { key: "privacy", icon: Download },
  { key: "help", icon: CircleHelp },
];

async function send(action: string, body: Record<string, unknown>) {
  const res = await fetch(`/api/auth/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const t = useTranslations("Account");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      <button aria-label={t("close")} onClick={onClose} className="absolute inset-0 bg-black/30" />
      <div role="dialog" aria-label={title} className="relative max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-2xl border border-line/30 bg-white p-7">
        <button type="button" onClick={onClose} aria-label={t("close")} className="absolute right-4 top-4 text-ink-muted">
          <X size={20} strokeWidth={1.75} />
        </button>
        <h3 className="mb-4 font-display text-lg font-bold text-ink">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">{label}</span>
      {children}
    </label>
  );
}

function ProfileForm({ user, onDone }: { user: SessionUser; onDone: () => void }) {
  const t = useTranslations("Account");
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName);
  const [phone, setPhone] = useState(user.phone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await send("profile", { fullName, phone });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? t("generic"));
    setSaved(true);
    router.refresh();
    setTimeout(onDone, 700);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label={t("fullName")}>
        <input required maxLength={80} value={fullName} onChange={(e) => setFullName(e.target.value)} className="field" autoComplete="name" />
      </Field>
      <Field label={t("phoneOpt")}>
        <input maxLength={40} value={phone} onChange={(e) => setPhone(e.target.value)} className="field" autoComplete="tel" />
      </Field>
      <p className="text-xs leading-relaxed text-ink-muted">
        {t.rich("emailNote", {
          email: user.email,
          b: (c) => <strong className="text-ink">{c}</strong>,
          link: (c) => <Link href="/contact" className="underline">{c}</Link>,
        })}
      </p>
      {error && <p role="alert" className="text-[13px] text-clay">{error}</p>}
      <button type="submit" disabled={busy || saved} className="btn-primary !rounded-full disabled:opacity-60">
        {saved ? t("saved") : busy ? t("saving") : t("saveChanges")}
      </button>
    </form>
  );
}

function PasswordForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations("Account");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next !== confirm) return setError(t("mismatch"));
    setBusy(true);
    setError("");
    const r = await send("password", { currentPassword: current, password: next });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? t("generic"));
    setSaved(true);
    setTimeout(onDone, 900);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label={t("currentPass")}>
        <input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} className="field" autoComplete="current-password" />
      </Field>
      <Field label={t("newPass")}>
        <input type="password" required minLength={10} maxLength={72} value={next} onChange={(e) => setNext(e.target.value)} className="field" autoComplete="new-password" />
      </Field>
      <Field label={t("confirmPass")}>
        <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field" autoComplete="new-password" />
      </Field>
      <p className="text-xs text-ink-muted">{t("passHint")}</p>
      {error && <p role="alert" className="text-[13px] text-clay">{error}</p>}
      <button type="submit" disabled={busy || saved} className="btn-primary !rounded-full disabled:opacity-60">
        {saved ? t("passUpdated") : busy ? t("saving") : t("updatePass")}
      </button>
    </form>
  );
}

function PrivacyPanel() {
  const t = useTranslations("Account");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function remove(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await send("delete", { password });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? t("generic"));
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-1 text-sm font-semibold text-ink">{t("downloadTitle")}</p>
        <p className="mb-3 text-xs leading-relaxed text-ink-muted">{t("downloadText")}</p>
        {/* A file download, not a page, so a plain link is right here */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/api/auth/export" className="inline-flex items-center gap-2 rounded-full border border-teal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-teal">
          <Download size={15} strokeWidth={2} /> {t("download")}
        </a>
      </div>

      <div className="border-t border-line/25 pt-5">
        <p className="mb-1 text-sm font-semibold text-ink">{t("deleteTitle")}</p>
        <p className="mb-3 text-xs leading-relaxed text-ink-muted">
          {t.rich("deleteText", { link: (c) => <Link href="/privacy" className="underline">{c}</Link> })}
        </p>
        {!confirming ? (
          <button type="button" onClick={() => setConfirming(true)} className="rounded-full border border-clay px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-clay">
            {t("deleteBtn")}
          </button>
        ) : (
          <form onSubmit={remove} className="flex flex-col gap-3">
            <Field label={t("confirmPassword")}>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" autoComplete="current-password" />
            </Field>
            {error && <p role="alert" className="text-[13px] text-clay">{error}</p>}
            <button type="submit" disabled={busy} className="rounded-full bg-clay px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60">
              {busy ? t("deleting") : t("deleteFinal")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function AccountClient({ user }: { user: SessionUser }) {
  const t = useTranslations("Account");
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [open, setOpen] = useState<SettingKey | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const name = user.fullName || user.email.split("@")[0];
  const initials = name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const memberSince = new Date(user.createdAt).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { month: "short", year: "numeric" });

  async function signOut() {
    setSigningOut(true);
    await send("logout", {});
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[860px] px-6 py-8 pb-24">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-teal">
            <span className="font-display text-[28px] font-bold text-white">{initials}</span>
          </div>
          <div>
            <h1 className="mb-1 font-serif text-[26px] font-medium text-ink sm:text-[32px]">{name}</h1>
            <p className="mb-2.5 text-sm text-ink-muted">{user.email}</p>
            <span className="rounded-full bg-teal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-teal">{t("member")}</span>
          </div>
        </div>
        <button type="button" onClick={signOut} disabled={signingOut} className="rounded-full border border-line px-4.5 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted disabled:opacity-60">
          {signingOut ? t("signingOut") : t("signOut")}
        </button>
      </div>

      <div className="hide-scrollbar mb-9 flex gap-1 overflow-x-auto border-b border-line/25">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => (tab.key === "orders" ? router.push("/account/orders") : setActiveTab(tab.key))}
              className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                active ? "border-teal text-teal" : "border-transparent text-ink-muted"
              }`}
            >
              <Icon size={17} strokeWidth={1.75} />
              {t(`tabs.${tab.key}`)}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-line/20 bg-white p-6">
            <h2 className="mb-1.5 font-serif text-xl font-medium text-teal">{t("welcome", { name: name.split(" ")[0] })}</h2>
            <p className="flex items-center gap-2 text-sm text-ink-muted">
              <Star size={15} strokeWidth={1.75} className="text-teal" />
              {t("memberSince", { date: memberSince })}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { href: "/shop", label: t("browse"), desc: t("browseDesc"), icon: ShoppingBag },
              { href: "/quiz", label: t("takeQuiz"), desc: t("takeQuizDesc"), icon: HelpCircle },
              { href: "/consultation", label: t("book"), desc: t("bookDesc"), icon: CalendarDays },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <Link key={c.href} href={c.href} className="flex flex-col gap-2.5 rounded-2xl border border-line/20 bg-white p-5 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
                  <Icon size={22} strokeWidth={1.75} className="text-teal" />
                  <p className="font-display text-[15px] font-semibold text-ink">{c.label}</p>
                  <p className="text-xs text-ink-muted">{c.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "quizzes" && (
        <div className="rounded-2xl border border-line/20 bg-white px-6 py-12 text-center">
          <HelpCircle size={30} strokeWidth={1.5} className="mx-auto mb-3 text-ink-muted" />
          <p className="mb-1 font-display text-base font-semibold text-ink">{t("noQuiz")}</p>
          <p className="mb-5 text-sm text-ink-muted">{t("noQuizText")}</p>
          <Link href="/quiz" className="btn-primary inline-block !rounded-full">{t("takeQuiz")}</Link>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="flex flex-col gap-3.5">
          {SETTINGS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setOpen(s.key)}
                className="flex items-center gap-4 rounded-2xl border border-line/20 bg-white px-6 py-4.5 text-left transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]"
              >
                <Icon size={22} strokeWidth={1.75} className="text-teal" />
                <div className="flex-1">
                  <p className="mb-0.5 font-display text-[15px] font-semibold text-ink">{t(`settings.${s.key}.label`)}</p>
                  <p className="text-xs text-ink-muted">{t(`settings.${s.key}.desc`)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title={t(`settings.${open}.label`)} onClose={() => setOpen(null)}>
          {open === "profile" && <ProfileForm user={user} onDone={() => setOpen(null)} />}
          {open === "password" && <PasswordForm onDone={() => setOpen(null)} />}
          {open === "privacy" && <PrivacyPanel />}
          {open === "email" && (
            <p className="text-sm leading-relaxed text-ink-muted">
              {t.rich("emailPrefs", { b: (c) => <strong className="text-ink">{c}</strong> })}
            </p>
          )}
          {open === "help" && (
            <p className="text-sm leading-relaxed text-ink-muted">
              {t.rich("helpText", { link: (c) => <Link href="/contact" className="font-semibold text-teal underline">{c}</Link> })}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
