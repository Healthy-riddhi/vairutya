import { STRAPI_URL } from "@/lib/strapi";

/** Talks to Strapi's server-only consultation endpoints (protected by the shared site secret). */
export type Availability = Record<string, string[]>;

export type Fees = { INR: number; EUR: number }; // paise / cents, 0 = no payment

export type PaymentStatus = "pending_payment" | "payment_submitted" | "paid" | "payment_failed";

export type RequestView = {
  reference: string;
  token: string;
  status: "requested" | "confirmed" | "cancelled";
  date: string;
  slot: string;
  firstName: string;
  name: string;
  email: string;
  phone: string;
  language: "en" | "fr";
  meetingLink: string | null;
  note: string | null;
  /** null on requests made before payments existed */
  paymentStatus: PaymentStatus | null;
  paymentMethod: "upi_manual" | "razorpay" | null;
  currency: "INR" | "EUR" | null;
  amountMinor: number | null;
  utr: string | null;
  razorpayOrderId: string | null;
};

export type CreatedRequest = {
  reference: string;
  token: string;
  /** "pending_payment" when a fee applies, otherwise null (a free request) */
  payment: PaymentStatus | null;
  amountMinor: number | null;
  currency: "INR" | "EUR" | null;
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

/** Open slots, and what a consultation costs (so the booking page can show the fee). */
export async function getBookingInfo(): Promise<{ days: Availability; fees: Fees }> {
  try {
    const r = await call("/availability");
    if (!r.ok) console.error("[consultation] availability responded", r.status);
    const f = r.json?.fees;
    return {
      days: r.ok ? (r.json?.days ?? {}) : {},
      fees: { INR: Number(f?.INR) > 0 ? Number(f.INR) : 0, EUR: Number(f?.EUR) > 0 ? Number(f.EUR) : 0 },
    };
  } catch (err) {
    console.error("[consultation] could not load availability:", err);
    return { days: {}, fees: { INR: 0, EUR: 0 } };
  }
}

export async function getAvailability(): Promise<Availability> {
  return (await getBookingInfo()).days;
}

export async function createRequest(data: {
  name: string;
  email: string;
  phone: string;
  concern: string;
  date: string;
  slot: string;
  language: "en" | "fr";
  currency: "INR" | "EUR";
  paymentMethod: "upi_manual" | "razorpay";
}): Promise<CreatedRequest> {
  const r = await call("/requests", { method: "POST", body: data });
  if (r.status === 409) throw new SlotTakenError();
  if (!r.ok || !r.json?.reference) throw new Error(`Could not save the request (${r.status})`);
  return {
    reference: r.json.reference,
    token: r.json.token,
    payment: r.json.payment ?? null,
    amountMinor: r.json.amountMinor ?? null,
    currency: r.json.currency ?? null,
  };
}

export async function getRequest(reference: string, token: string): Promise<RequestView | null> {
  try {
    const r = await call(`/requests/${encodeURIComponent(reference)}?t=${encodeURIComponent(token)}`);
    return r.ok ? (r.json?.request ?? null) : null;
  } catch {
    return null;
  }
}

const enc = encodeURIComponent;

/** Razorpay: remember which Razorpay order belongs to this request. */
export async function attachConsultationPayment(reference: string, token: string, razorpayOrderId: string) {
  const r = await call(`/requests/${enc(reference)}/payment`, { method: "POST", body: { token, razorpayOrderId } });
  if (!r.ok) throw new Error(`Could not link payment (${r.status})`);
}

/** UPI: the customer gives the reference of their payment. `changed` is false if it was already past that step. */
export async function submitConsultationUtr(
  reference: string,
  token: string,
  utr: string
): Promise<{ request: RequestView; changed: boolean } | null> {
  const r = await call(`/requests/${enc(reference)}/utr`, { method: "POST", body: { token, utr } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Could not save the reference (${r.status})`);
  return r.json;
}

export class ConsultationAmountMismatch extends Error {}

/** Idempotent. `justPaid` is true only the first time, so emails go out once. */
export async function markConsultationPaid(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  amountMinor?: number,
  currency?: string
): Promise<{ request: RequestView; justPaid: boolean } | null> {
  const r = await call("/pay", { method: "POST", body: { razorpayOrderId, razorpayPaymentId, amountMinor, currency } });
  if (r.status === 404) return null;
  if (r.status === 409) throw new ConsultationAmountMismatch("Paid amount does not match the booking");
  if (!r.ok) throw new Error(`Could not record payment (${r.status})`);
  return r.json;
}

export async function markConsultationFailed(razorpayOrderId: string) {
  await call("/fail", { method: "POST", body: { razorpayOrderId } });
}
