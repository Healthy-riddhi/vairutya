import { STRAPI_URL } from "@/lib/strapi";
import type { SkinSequence } from "@/lib/skin-sequences";

/** Talks to Strapi's server-only quiz-drip endpoints (protected by the shared site secret). */
export type DueItem = {
  id: number;
  email: string;
  firstName: string;
  sequence: SkinSequence;
  step: number;
  language: "en" | "fr";
  token: string;
  startedAt: string;
};

async function call(path: string, init: { method?: string; body?: unknown } = {}) {
  const res = await fetch(`${STRAPI_URL}/api/quiz-drip${path}`, {
    method: init.method ?? "GET",
    headers: {
      ...(process.env.SITE_SECRET ? { "x-site-key": process.env.SITE_SECRET } : {}),
      ...(init.body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  return { ok: res.ok, status: res.status, json: await res.json().catch(() => null) };
}

export async function subscribeToDrip(data: {
  email: string;
  firstName: string;
  quizSlug: string;
  sequence: SkinSequence;
  language: "en" | "fr";
}) {
  const r = await call("/subscribe", { method: "POST", body: data });
  if (!r.ok) throw new Error(`Could not save the subscriber (${r.status})`);
}

export async function getDue(limit: number): Promise<DueItem[]> {
  const r = await call(`/due?limit=${limit}`);
  if (!r.ok) throw new Error(`Could not load who is due (${r.status})`);
  return r.json?.items ?? [];
}

/** Reserve an email before sending it. Returns null if someone else already took it. */
export async function claim(id: number, step: number): Promise<{ previousLastSentAt: string | null } | null> {
  const r = await call("/claim", { method: "POST", body: { id, step } });
  if (!r.ok) throw new Error(`Could not reserve the email (${r.status})`);
  return r.json?.ok ? { previousLastSentAt: r.json.previousLastSentAt ?? null } : null;
}

export async function release(id: number, step: number, previousLastSentAt: string | null) {
  await call("/release", { method: "POST", body: { id, step, previousLastSentAt } });
}

export async function stop(id: number, status: "unsubscribed" | "expired") {
  await call("/stop", { method: "POST", body: { id, status } });
}

/** False when the link is not recognised. */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const r = await call("/unsubscribe", { method: "POST", body: { token } });
  if (r.status === 404 || r.status === 400) return false;
  if (!r.ok) throw new Error(`Could not unsubscribe (${r.status})`);
  return true;
}
