import { NextResponse } from "next/server";
import { notifyAddress, sendEmail, siteUrl } from "@/lib/brevo";
import { bad, clean, clientIp, isEmail, rateLimited, readJson, tooMany } from "@/lib/api-utils";
import { bookingConfirmation, bookingNotification } from "@/lib/email-templates";
import { SlotTakenError, createRequest } from "@/lib/consultation-api";
import { longDate, slotLabel } from "@/lib/consultation";

/**
 * A consultation *request*. It is saved in Strapi first (that is the source of truth),
 * which also checks the slot is really open. Emails afterwards are best effort.
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

  let saved: { reference: string; token: string };
  try {
    saved = await createRequest({ name, email, phone, concern, date, slot, language: locale });
  } catch (err) {
    if (err instanceof SlotTakenError) {
      return NextResponse.json({ error: "That time is no longer available.", code: "slot_unavailable" }, { status: 409 });
    }
    console.error("[consultation] could not save the request:", err);
    return NextResponse.json({ error: "We couldn't save your request. Please try again in a moment." }, { status: 502 });
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

  return NextResponse.json({ ok: true, reference: saved.reference, token: saved.token });
}
