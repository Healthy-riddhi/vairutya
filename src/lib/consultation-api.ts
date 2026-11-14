import { STRAPI_URL } from "@/lib/strapi";

/** Talks to Strapi's server-only consultation endpoints (protected by the shared site secret). */
export type Availability = Record<string, string[]>;

export type RequestView = {
  reference: string;
  status: "requested" | "confirmed" | "cancelled";
  date: string;
  slot: string;
  firstName: string;
  meetingLink: string | null;
  note: string | null;
};

export class SlotTakenError extends Error {}

async function call(path: string, init: { method?: string; body?: unknown } = {}) {
  const res = await fetch(`${STRAPI_URL}/api/consultation${path}`, {
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

export async function getAvailability(): Promise<Availability> {
  try {
    const r = await call("/availability");
    if (!r.ok) console.error("[consultation] availability responded", r.status);
    return r.ok ? (r.json?.days ?? {}) : {};
  } catch (err) {
    console.error("[consultation] could not load availability:", err);
    return {};
  }
}

export async function createRequest(data: {
  name: string;
  email: string;
  phone: string;
  concern: string;
  date: string;
  slot: string;
  language: "en" | "fr";
}): Promise<{ reference: string; token: string }> {
  const r = await call("/requests", { method: "POST", body: data });
  if (r.status === 409) throw new SlotTakenError();
  if (!r.ok || !r.json?.reference) throw new Error(`Could not save the request (${r.status})`);
  return r.json;
}

export async function getRequest(reference: string, token: string): Promise<RequestView | null> {
  try {
    const r = await call(`/requests/${encodeURIComponent(reference)}?t=${encodeURIComponent(token)}`);
    return r.ok ? (r.json?.request ?? null) : null;
  } catch {
    return null;
  }
}
