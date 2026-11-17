import { NextResponse } from "next/server";
import { clean, clientIp, rateLimited, readJson } from "@/lib/api-utils";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { getRequest, markConsultationPaid, submitConsultationUtr } from "@/lib/consultation-api";
import { sendConsultationPaidEmails, sendConsultationPaymentSubmitted } from "@/lib/consultation-emails";

/**
 * POST /api/consultation/<action>
 *   verify → after paying in Razorpay's window: prove the payment is genuine, mark it paid
 *   submit → UPI: the customer gives the reference of their payment (you then check it in Strapi)
 * The booking itself is created by POST /api/consultation.
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

async function verify(body: Record<string, unknown>, ip: string) {
  if (rateLimited(`consult-verify:${ip}`, 20, TEN_MIN)) return fail("Too many attempts. Please wait a few minutes.", 429);
  const orderId = clean(body.razorpay_order_id, 80);
  const paymentId = clean(body.razorpay_payment_id, 80);
  const signature = clean(body.razorpay_signature, 200);
  if (!orderId || !paymentId || !signature) return fail("Payment details are missing.");
  if (!verifyPaymentSignature(orderId, paymentId, signature)) {
    console.error("[consultation] bad payment signature for", orderId);
    return fail("We couldn't verify that payment. If you were charged, please contact us.", 400, "bad_signature");
  }
  const r = await markConsultationPaid(orderId, paymentId);
  if (!r) return fail("We couldn't find that booking.", 404);
  if (r.justPaid) await sendConsultationPaidEmails(r.request);
  return json({ ok: true, reference: r.request.reference, token: r.request.token });
}

async function submit(body: Record<string, unknown>, ip: string) {
  if (rateLimited(`consult-utr:${ip}`, 15, TEN_MIN)) return fail("Too many attempts. Please wait a few minutes.", 429);
  const reference = clean(body.reference, 20);
  const token = clean(body.token, 64);
  const utr = clean(body.utr, 40).replace(/\s+/g, "");
  if (!/^[A-Za-z0-9]{8,40}$/.test(utr)) {
    return fail("Please enter the reference from your UPI app (letters and numbers, at least 8).", 400, "bad_utr");
  }
  if (!reference || !token || !(await getRequest(reference, token))) return fail("We couldn't find that booking.", 404);
  const r = await submitConsultationUtr(reference, token, utr);
  if (!r) return fail("We couldn't find that booking.", 404);
  if (r.changed) await sendConsultationPaymentSubmitted(r.request, utr);
  return json({ ok: true });
}

export async function POST(req: Request, { params }: Ctx) {
  const { action } = await params;
  if (!sameOrigin(req)) return fail("Request blocked.", 403);
  const body = (await readJson(req)) ?? {};
  const ip = clientIp(req);
  try {
    switch (action) {
      case "verify":
        return await verify(body, ip);
      case "submit":
        return await submit(body, ip);
      default:
        return fail("Not found.", 404);
    }
  } catch (err) {
    console.error("[consultation]", err);
    return fail("Something went wrong. Please try again.", 502);
  }
}
