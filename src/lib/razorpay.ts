import crypto from "node:crypto";

/**
 * Razorpay: the customer types their card into Razorpay's own window, so card numbers never
 * reach this website. We create the payment, and check cryptographically that it was paid.
 *
 * .env.local: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
 */
const API = process.env.RAZORPAY_API_URL ?? "https://api.razorpay.com/v1";

export class PaymentsNotConfigured extends Error {}

function keys() {
  const id = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw new PaymentsNotConfigured("Razorpay keys are not set");
  return { id, secret };
}

export function paymentsEnabled(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export async function createRazorpayOrder(opts: {
  amountMinor: number;
  currency: "INR" | "EUR";
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; keyId: string }> {
  const { id: keyId, secret } = keys();
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${Buffer.from(`${keyId}:${secret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: opts.amountMinor,
      currency: opts.currency,
      receipt: opts.receipt,
      notes: opts.notes ?? {},
    }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.id) {
    throw new Error(`Razorpay order failed (${res.status}): ${json?.error?.description ?? "unknown"}`);
  }
  if (json.amount !== opts.amountMinor || json.currency !== opts.currency) {
    throw new Error("Razorpay order does not match the requested amount");
  }
  return { id: json.id as string, keyId };
}

function sameHex(a: string, b: string): boolean {
  const x = Buffer.from(a, "utf8");
  const y = Buffer.from(b, "utf8");
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Proof, from the browser's payment result, that Razorpay really received this payment. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const { secret } = keys();
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return sameHex(expected, signature);
}

/** Proof that a webhook call really came from Razorpay. `rawBody` must be the untouched text. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new PaymentsNotConfigured("RAZORPAY_WEBHOOK_SECRET is not set");
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return sameHex(expected, signature);
}
