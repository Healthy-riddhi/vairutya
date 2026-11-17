import { NextResponse } from "next/server";
import { notifyAddress, sendEmail, siteUrl } from "@/lib/brevo";
import { bad, clean, clientIp, isEmail, rateLimited, readJson, tooMany } from "@/lib/api-utils";
import { bookingConfirmation, bookingNotification } from "@/lib/email-templates";
import { SlotTakenError, attachConsultationPayment, createRequest } from "@/lib/consultation-api";
import { longDate, slotLabel } from "@/lib/consultation";
import { PaymentsNotConfigured, createRazorpayOrder, paymentsEnabled } from "@/lib/razorpay";
import { getBusinessDetails } from "@/lib/business";

/**
 * A consultation booking. It is saved in Strapi first (that is the source of truth),
 * which also checks the slot is really open.
 *
 * If a fee is set in Strapi (Consultation Availability), the customer is sent straight to
 * payment, exactly like a product order, and the emails go out once they have paid.
 * With no fee set, it stays a free request and the emails go out straight away.
 */
export async function POST(req: Request) {
  const body = await readJson(req);
  const name = clean(body?.name, 80);
  const phone = clean(body?.phone, 40);
  const email = clean(body?.email, 254);
  const concern = clean(body?.concern, 2000);
  const date = clean(body?.date, 10);
  const slot = clean(body?.slot, 5);
  const locale: "en" | "fr" = body?.locale === "fr" ? "fr" : "en";

  if (!body || !name || !phone || !isEmail(email)) {
    return bad("Please fill in your name, mobile number and a valid email.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(slot)) {
    return bad("Please choose a valid date and time slot.");
  }

  if (rateLimited(`consultation:${clientIp(req)}`, 3, 10 * 60_000)) return tooMany();

  const manual = process.env.PAYMENT_MODE !== "razorpay"; // UPI, confirmed by hand in Strapi
  const currency = locale === "fr" ? "EUR" : "INR";

  let saved: Awaited<ReturnType<typeof createRequest>>;
  try {
    saved = await createRequest({
      name, email, phone, concern, date, slot,
      language: locale,
      currency,
      paymentMethod: manual ? "upi_manual" : "razorpay",
    });
  } catch (err) {
    if (err instanceof SlotTakenError) {
      return NextResponse.json({ error: "That time is no longer available.", code: "slot_unavailable" }, { status: 409 });
    }
    console.error("[consultation] could not save the request:", err);
    return NextResponse.json({ error: "We couldn't save your request. Please try again in a moment.", }, { status: 502 });
  }

  // A fee applies: go to payment. The emails are sent after the payment, not now.
  if (saved.payment === "pending_payment" || saved.payment === "payment_submitted") {
    const base = { ok: true, reference: saved.reference, token: saved.token };
    if (saved.currency === "EUR" && process.env.FR_PAYMENTS_ENABLED !== "true") {
      return NextResponse.json({ error: "Payments in euros aren't open yet.", code: "payments_fr_off" }, { status: 403 });
    }
    if (manual) {
      if (!(await getBusinessDetails()).upiId) {
        return NextResponse.json({ error: "Payments aren't switched on yet. Please check back soon.", code: "payments_off" }, { status: 503 });
      }
      return NextResponse.json({ ...base, mode: "upi" });
    }
    try {
      if (!paymentsEnabled()) throw new PaymentsNotConfigured("not configured");
      const rz = await createRazorpayOrder({
        amountMinor: saved.amountMinor!,
        currency: saved.currency!,
        receipt: saved.reference,
        notes: { consultation: saved.reference },
      });
      await attachConsultationPayment(saved.reference, saved.token, rz.id);
      return NextResponse.json({
        ...base,
        mode: "razorpay",
        razorpayOrderId: rz.id,
        keyId: rz.keyId,
        amountMinor: saved.amountMinor,
        currency: saved.currency,
        prefill: { name, email, contact: phone },
      });
    } catch (err) {
      console.error("[consultation] could not start the payment:", err);
      const off = err instanceof PaymentsNotConfigured;
      return NextResponse.json(
        { error: off ? "Payments aren't switched on yet. Please check back soon." : "We couldn't start the payment. Please try again.", code: off ? "payments_off" : undefined },
        { status: off ? 503 : 502 }
      );
    }
  }

  const statusUrl = `${siteUrl()}${locale === "fr" ? "/fr" : ""}/consultation/confirmed?ref=${encodeURIComponent(saved.reference)}&t=${encodeURIComponent(saved.token)}`;
  const booking = { name, email, phone, concern, date, slot: `${slotLabel(slot, "en")} IST` };

  try {
    await sendEmail(bookingNotification(notifyAddress(), booking));
  } catch (err) {
    console.error(`[consultation] team email for ${saved.reference} failed (the request is saved in Strapi):`, err);
  }

  try {
    const when =
      locale === "fr"
        ? `${longDate(date, "fr")} à ${slotLabel(slot, "fr")} (heure de l’Inde)`
        : `${longDate(date, "en")} at ${slotLabel(slot, "en")} IST (India Standard Time)`;
    await sendEmail(bookingConfirmation(booking, { locale, statusUrl, when }));
  } catch (err) {
    console.error("[consultation] customer acknowledgement failed:", err);
  }

  return NextResponse.json({ ok: true, reference: saved.reference, token: saved.token, mode: "free" });
}
