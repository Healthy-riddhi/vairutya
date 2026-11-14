import { STRAPI_URL } from "@/lib/strapi";

/** Talks to Strapi's server-only order endpoints (protected by the shared site secret). */
export type StoredOrder = {
  orderNumber: string;
  status: string;
  country: "IN" | "FR";
  currency: "INR" | "EUR";
  items: { slug: string; name: string; qty: number; unitMinor: number; lineMinor: number }[];
  subtotalMinor: number;
  shippingMinor: number;
  taxIncludedMinor: number | null;
  totalMinor: number;
  shippingAddress: Record<string, string>;
  email: string;
  customerName: string;
  razorpayOrderId: string | null;
  paymentMethod: "razorpay" | "upi_manual";
  utr: string | null;
  language: "en" | "fr";
  carrier: string | null;
  trackingNumber: string | null;
  createdAt: string;
  paidAt: string | null;
};

export class AmountMismatch extends Error {}

async function shop(path: string, opts: { method?: string; body?: unknown } = {}) {
  const res = await fetch(`${STRAPI_URL}/api/shop${path}`, {
    method: opts.method ?? "GET",
    headers: {
      ...(process.env.SITE_SECRET ? { "x-site-key": process.env.SITE_SECRET } : {}),
      ...(opts.body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

export async function createOrder(data: Record<string, unknown>): Promise<string> {
  const r = await shop("/orders", { method: "POST", body: data });
  if (!r.ok || !r.json?.orderNumber) throw new Error(`Could not save order (${r.status})`);
  return r.json.orderNumber as string;
}

export async function attachPayment(orderNumber: string, razorpayOrderId: string) {
  const r = await shop(`/orders/${encodeURIComponent(orderNumber)}/payment`, {
    method: "POST",
    body: { razorpayOrderId },
  });
  if (!r.ok) throw new Error(`Could not link payment (${r.status})`);
}

/** Idempotent. `justPaid` is true only the first time, so emails go out once. */
export async function markPaid(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  amountMinor?: number,
  currency?: string
): Promise<{ order: StoredOrder; justPaid: boolean } | null> {
  const r = await shop("/pay", {
    method: "POST",
    body: { razorpayOrderId, razorpayPaymentId, amountMinor, currency },
  });
  if (r.status === 404) return null;
  if (r.status === 409) throw new AmountMismatch("Paid amount does not match the order");
  if (!r.ok) throw new Error(`Could not record payment (${r.status})`);
  return r.json;
}

export async function markFailed(razorpayOrderId: string) {
  await shop("/fail", { method: "POST", body: { razorpayOrderId } });
}

export async function listOrders(userId: number): Promise<StoredOrder[]> {
  const r = await shop(`/orders?userId=${userId}`);
  return r.ok ? (r.json?.orders ?? []) : [];
}

export async function getOrder(orderNumber: string, userId: number): Promise<StoredOrder | null> {
  const r = await shop(`/orders/${encodeURIComponent(orderNumber)}?userId=${userId}`);
  return r.ok ? (r.json?.order ?? null) : null;
}

/** UPI: the customer gives the reference of their payment. `changed` is false if the order was already past that step. */
export async function submitUtr(
  orderNumber: string,
  userId: number,
  utr: string
): Promise<{ order: StoredOrder; changed: boolean } | null> {
  const r = await shop(`/orders/${encodeURIComponent(orderNumber)}/utr`, { method: "POST", body: { userId, utr } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Could not save the reference (${r.status})`);
  return r.json;
}
