import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { AmountMismatch, markFailed, markPaid } from "@/lib/orders";
import { sendPaidEmails } from "@/lib/order-emails";
import { ConsultationAmountMismatch, markConsultationFailed, markConsultationPaid } from "@/lib/consultation-api";
import { sendConsultationPaidEmails } from "@/lib/consultation-emails";

type RazorpayEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; amount?: number; currency?: string } };
    order?: { entity?: { id?: string } };
  };
};

/**
 * Razorpay tells us about payments directly, even if the customer closes their browser
 * right after paying. This is the reliable source of truth.
 * Set it up in Razorpay: Settings → Webhooks → https://YOUR-SITE/api/webhooks/razorpay
 * with events payment.captured, order.paid and payment.failed.
 */
export async function POST(req: Request) {
  const raw = await req.text(); // must be the untouched text for the signature to match
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  let valid = false;
  try {
    valid = verifyWebhookSignature(raw, signature);
  } catch (err) {
    console.error("[webhook]", (err as Error).message);
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  if (!valid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  let event: RazorpayEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }

  const payment = event?.payload?.payment?.entity;
  const orderId: string | undefined = payment?.order_id ?? event?.payload?.order?.entity?.id;

  try {
    if ((event.event === "payment.captured" || event.event === "order.paid") && orderId) {
      const r = await markPaid(orderId, payment?.id ?? "", payment?.amount, payment?.currency);
      if (r?.justPaid) await sendPaidEmails(r.order);
      if (!r) {
        // not a product order: it may be a consultation booking
        const c = await markConsultationPaid(orderId, payment?.id ?? "", payment?.amount, payment?.currency);
        if (c?.justPaid) await sendConsultationPaidEmails(c.request);
      }
    } else if (event.event === "payment.failed" && orderId) {
      await markFailed(orderId);
      await markConsultationFailed(orderId);
    }
  } catch (err) {
    if (err instanceof AmountMismatch || err instanceof ConsultationAmountMismatch) {
      // Recorded on the order in Strapi for you to look at. Retrying would never fix it.
      console.error("[webhook] AMOUNT MISMATCH for", orderId, "(see the order's notes in Strapi)");
      return NextResponse.json({ ok: true });
    }
    console.error("[webhook] could not process", event?.event, err);
    // A 5xx makes Razorpay try again later.
    return NextResponse.json({ error: "Temporary problem" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
