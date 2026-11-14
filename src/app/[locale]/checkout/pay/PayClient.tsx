"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function CopyButton({ text }: { text: string }) {
  const t = useTranslations("Pay");
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        });
      }}
      className="rounded-full border border-teal px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-teal"
    >
      {done ? t("copied") : t("copy")}
    </button>
  );
}

export function UtrForm({ orderNumber, initial = "" }: { orderNumber: string; initial?: string }) {
  const t = useTranslations("Pay");
  const router = useRouter();
  const [utr, setUtr] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber, utr }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 401) return router.push(`/login?next=${encodeURIComponent(`/checkout/pay?order=${orderNumber}`)}`);
      if (!res.ok) throw new Error(data?.code === "bad_utr" ? t("invalid") : (data?.error ?? t("generic")));
      router.refresh(); // the page now shows "we're verifying"
    } catch (err) {
      setError(err instanceof Error ? err.message : t("generic"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">{t("utrLabel")}</span>
        <input
          className="field"
          value={utr}
          onChange={(e) => setUtr(e.target.value)}
          placeholder={t("utrPh")}
          inputMode="text"
          autoComplete="off"
          maxLength={40}
          required
        />
      </label>
      <p className="text-xs leading-relaxed text-ink-muted">{t("utrHelp")}</p>
      {error && (
        <p role="alert" className="text-[13px] text-clay">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy || utr.trim().length < 8} className="btn-primary !rounded-full disabled:opacity-60">
        {busy ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
