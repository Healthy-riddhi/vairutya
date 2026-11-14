"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Mail, MapPin, Phone } from "lucide-react";
import type { BusinessDetails } from "@/lib/business";

export function ContactClient({ details }: { details: BusinessDetails }) {
  const t = useTranslations("Contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("generic"));
      }
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("generic"));
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-[860px] px-6 py-16 pb-24">
      <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">VAIRUTYA</p>
      <h1 className="mb-4 font-serif text-4xl font-medium text-ink">{t("title")}</h1>
      <p className="mb-12 max-w-[480px] text-[15px] leading-relaxed text-ink-muted">{t("intro")}</p>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.3fr]">
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-3.5">
            <Mail size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-teal" />
            <div>
              <p className="mb-0.5 font-display text-sm font-bold text-ink">{t("email")}</p>
              <a href={`mailto:${details.email}`} className="inline-block py-2 text-sm text-ink-muted hover:text-teal">{details.email}</a>
            </div>
          </div>
          <div className="flex items-start gap-3.5">
            <Phone size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-teal" />
            <div>
              <p className="mb-0.5 font-display text-sm font-bold text-ink">{t("phone")}</p>
              <a href={`tel:${details.phone.replace(/[^+\d]/g, "")}`} className="inline-block py-2 text-sm text-ink-muted hover:text-teal">{details.phone}</a>
            </div>
          </div>
          <div className="flex items-start gap-3.5">
            <MapPin size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-teal" />
            <div>
              <p className="mb-0.5 font-display text-sm font-bold text-ink">{t("studio")}</p>
              <p className="text-sm text-ink-muted">{details.studio}</p>
            </div>
          </div>
        </div>

        {status === "done" ? (
          <div className="rounded-2xl border border-line/20 bg-white p-8 text-center">
            <p className="font-serif text-xl font-medium text-teal">{t("sent")}</p>
            <p className="mt-2 text-sm text-ink-muted">{t("sentText", { email })}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink">{t("name")}</label>
              <input type="text" required placeholder={t("namePh")} value={name} onChange={(e) => setName(e.target.value)} className="field" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink">{t("emailLabel")}</label>
              <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-ink">{t("message")}</label>
              <textarea required rows={5} placeholder={t("messagePh")} value={message} onChange={(e) => setMessage(e.target.value)} className="field h-auto resize-none py-3 leading-relaxed" />
            </div>
            <button type="submit" disabled={status === "loading"} className="btn-primary mt-2">
              {status === "loading" ? t("sending") : t("send")}
            </button>
            {status === "error" && <p role="alert" className="text-sm text-clay">{errorMsg}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
