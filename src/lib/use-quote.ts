"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { Quote } from "@/lib/shop";

/** Asks the server what this cart costs. French = France (euros), otherwise India (rupees). */
export function useQuote(items: { slug: string; qty: number }[]) {
  const country = useLocale() === "fr" ? "FR" : "IN";
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const key = JSON.stringify(items.map((i) => ({ slug: i.slug, qty: i.qty })));

  useEffect(() => {
    const list = JSON.parse(key) as { slug: string; qty: number }[];
    if (list.length === 0) {
      setQuote(null);
      setError(null);
      setLoading(false);
      return;
    }
    const ctl = new AbortController();
    setLoading(true);
    fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: list, country }),
      signal: ctl.signal,
    })
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.error ?? "We couldn't check prices right now.");
        setQuote(j.quote as Quote);
        setError(null);
      })
      .catch((e: Error) => {
        if (e.name === "AbortError") return;
        setQuote(null);
        setError(e.message);
      })
      .finally(() => {
        if (!ctl.signal.aborted) setLoading(false);
      });
    return () => ctl.abort();
  }, [key, country]);

  return { quote, error, loading };
}
