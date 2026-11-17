"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

/** One button, so opening the link from an email never unsubscribes anyone by accident. */
export function UnsubscribeClient({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(token ? "idle" : "error");
  const [message, setMessage] = useState(token ? "" : "This link is not valid.");

  async function go() {
    setState("busy");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Please try again.");
      setState("done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <>
        <h1 className="mb-3 font-serif text-3xl font-medium text-ink">You’re unsubscribed</h1>
        <p className="mb-8 text-base leading-relaxed text-ink-muted">
          We won’t send you any more emails from your skin quiz. Thank you for spending this time with us.
        </p>
        <Link href="/" className="btn-primary !rounded-full">Back to Vairutya</Link>
      </>
    );
  }
  return (
    <>
      <h1 className="mb-3 font-serif text-3xl font-medium text-ink">Stop these emails?</h1>
      <p className="mb-8 text-base leading-relaxed text-ink-muted">
        This stops the follow-up emails from your skin quiz. You can take the quiz again any time.
      </p>
      {state === "error" && <p role="alert" className="mb-4 text-[13px] text-clay">{message}</p>}
      {token && (
        <button type="button" onClick={go} disabled={state === "busy"} className="btn-primary !rounded-full disabled:opacity-60">
          {state === "busy" ? "One moment…" : "Yes, unsubscribe me"}
        </button>
      )}
    </>
  );
}
