import { NextResponse } from "next/server";
import { clean, clientIp, rateLimited, readJson } from "@/lib/api-utils";
import { getSessionUser } from "@/lib/session";
import { COUNTRY_NAME, priceCart, ShopError, type Country } from "@/lib/shop";
import {
  PaymentsNotConfigured,
  createRazorpayOrder,
  paymentsEnabled,
  verifyPaymentSignature,
} from "@/lib/razorpay";
import { attachPayment, createOrder, markPaid, submitUtr } from "@/lib/orders";
import { getBusinessDetails } from "@/lib/business";
import { sendPaidEmails, sendPaymentSubmittedEmails } from "@/lib/order-emails";

/**
 * POST /api/checkout/<action>
 *   quote   → the server's own price for a cart (nothing is saved)
 *   create  → save the order, start the payment (signed-in customers only)
 *   verify  → after paying: prove the payment is genuine and mark the order paid
 */
type Ctx = { params: Promise<{ action: string }> };
const NO_STORE = { "Cache-Control": "no-store" };
const TEN_MIN = 10 * 60_000;

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: NO_STORE });
const fail = (error: string, status = 400, code?: string) => json({ error, code }, status);

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function problem(err: unknown) {
  if (err instanceof ShopError) return fail(err.message, err.status);
  if (err instanceof PaymentsNotConfigured) {
    return fail("Payments aren't switched on yet. Please check back soon.", 503, "payments_off");
  }
  console.error("[checkout]", err);
  return fail("Something went wrong. Please try again.", 502);
}

type Address = {
  name: string; phone: string; line1: string; line2: string;
  city: string; state: string; postcode: string; country: Country;
};

function parseAddress(raw: unknown, country: Country): Address {
  const a = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const out: Address = {
    name: clean(a.name, 80),
    phone: clean(a.phone, 20),
    line1: clean(a.line1, 120),
    line2: clean(a.line2, 120),
    city: clean(a.city, 80),
    state: clean(a.state, 80),
    postcode: clean(a.postcode, 12).replace(/\s+/g, ""),
    country,
  };
  if (out.name.length < 2) throw new ShopError("Please enter the recipient's name.");
  if (!/^[+\d][\d\s-]{5,19}$/.test(out.phone)) throw new ShopError("Please enter a phone number the courier can reach.");
  if (out.line1.length < 3) throw new ShopError("Please enter the street address.");
  if (out.city.length < 2) throw new ShopError("Please enter the city.");
  if (country === "IN" && out.state.length < 2) throw new ShopError("Please enter the state.");
  if (country === "IN" && !/^\d{6}$/.test(out.postcode)) throw new ShopError("Indian PIN codes have 6 digits.");
  if (country === "FR" && !/^\d{5}$/.test(out.postcode)) throw new ShopError("French postcodes have 5 digits.");
  return out;
}

async function quote(body: Record<string, unknown>, ip: string) {
  if (rateLimited(`quote:${ip}`, 120, TEN_MIN)) return fail("Too many requests. Please slow down.", 429);
  return json({ quote: await priceCart(body.items, body.country) });
}

async function create(body: Record<string, unknown>, ip: string) {
  const user = await getSessionUser();
  if (!user) return fail("Please sign in to check out.", 401, "signin");
  if (rateLimited(`checkout:${ip}`, 20, TEN_MIN) || rateLimited(`checkout-user:${user.id}`, 10, TEN_MIN)) {
    return fail("Too many attempts. Please wait a few minutes.", 429);
  }
  const manual = process.env.PAYMENT_MODE !== "razorpay"; // UPI, confirmed by hand in Strapi
  if (!manual && !paymentsEnabled()) throw new PaymentsNotConfigured("not configured");
  if (manual && !(await getBusinessDetails()).upiId) throw new PaymentsNotConfigured("UPI ID not set");

  // 1. Price the cart on the server. Anything the browser says about prices is ignored.
  const q = await priceCart(body.items, body.country);
  if (q.country === "FR" && process.env.FR_PAYMENTS_ENABLED !== "true") {
    return fail("Payments in euros aren't open yet.", 403, "payments_fr_off");
  }
  const address = parseAddress(body.address, q.country);

  // 2. Save the order (waiting for payment).
  const orderNumber = await createOrder({
    userId: user.id,
    email: user.email,
    customerName: address.name,
    phone: address.phone,
    country: q.country,
    currency: q.currency,
    subtotalMinor: q.subtotalMinor,
    shippingMinor: q.shippingMinor,
    taxIncludedMinor: q.taxIncludedMinor,
    totalMinor: q.totalMinor,
    items: q.lines.map(({ slug, name, qty, unitMinor, lineMinor }) => ({ slug, name, qty, unitMinor, lineMinor })),
    shippingAddress: address,
    paymentMethod: manual ? "upi_manual" : "razorpay",
    language: body.locale === "fr" ? "fr" : "en",
  });

  if (manual) return json({ mode: "upi", orderNumber });

  // 3. Start the payment with Razorpay for exactly that amount.
  const rz = await createRazorpayOrder({
    amountMinor: q.totalMinor,
    currency: q.currency,
    receipt: orderNumber,
    notes: { orderNumber },
  });
  await attachPayment(orderNumber, rz.id);

  return json({
    orderNumber,
    razorpayOrderId: rz.id,
    keyId: rz.keyId,
    amountMinor: q.totalMinor,
    currency: q.currency,
    prefill: { name: address.name, email: user.email, contact: address.phone },
    country: COUNTRY_NAME[q.country],
  });
}

/** UPI: the customer enters the reference of their payment. You then check it and confirm in Strapi. */
async function submit(body: Record<string, unknown>, ip: string) {
  const user = await getSessionUser();
  if (!user) return fail("Please sign in again.", 401, "signin");
  if (rateLimited(`utr:${user.id}`, 10, TEN_MIN) || rateLimited(`utr-ip:${ip}`, 30, TEN_MIN)) {
    return fail("Too many attempts. Please wait a few minutes.", 429);
  }
  const orderNumber = clean(body.orderNumber, 20);
  const utr = clean(body.utr, 40).replace(/\s+/g, "");
  if (!/^[A-Za-z0-9]{8,40}$/.test(utr)) {
    return fail("Please enter the reference from your UPI app (letters and numbers, at least 8).", 400, "bad_utr");
  }
  const r = await submitUtr(orderNumber, user.id, utr);
  if (!r) return fail("We couldn't find that order.", 404);
  if (r.changed) await sendPaymentSubmittedEmails(r.order, utr);
  return json({ ok: true, status: r.order.status });
}

async function verify(body: Record<string, unknown>) {
  const user = await getSessionUser();
  if (!user) return fail("Please sign in again.", 401, "signin");

  const orderId = clean(body.razorpay_order_id, 80);
  const paymentId = clean(body.razorpay_payment_id, 80);
  const signature = clean(body.razorpay_signature, 200);
  if (!orderId || !paymentId || !signature) return fail("Payment details are missing.");

  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    console.error("[checkout] bad payment signature for", orderId);
    return fail("We couldn't verify that payment. If you were charged, please contact us.", 400, "bad_signature");
  }

  const r = await markPaid(orderId, paymentId);
  if (!r) return fail("We couldn't find that order.", 404);
  if (r.justPaid) await sendPaidEmails(r.order);
  return json({ ok: true, orderNumber: r.order.orderNumber });
}

export async function POST(req: Request, { params }: Ctx) {
  const { action } = await params;
  if (!sameOrigin(req)) return fail("Request blocked.", 403);
  const body = (await readJson(req)) ?? {};
  const ip = clientIp(req);

  try {
    switch (action) {
      case "quote":
        return await quote(body, ip);
      case "create":
        return await create(body, ip);
      case "verify":
        return await verify(body);
      case "submit":
        return await submit(body, ip);
      default:
        return fail("Not found.", 404);
    }
  } catch (err) {
    return problem(err);
  }
}
