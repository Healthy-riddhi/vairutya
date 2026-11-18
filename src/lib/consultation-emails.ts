import { notifyAddress, sendEmail, siteUrl, type Mail } from "@/lib/brevo";
import { formatMinor } from "@/lib/money";
import { esc, layout, p, rows, button } from "@/lib/email-templates";
import { longDate, slotLabel } from "@/lib/consultation";
import type { RequestView } from "@/lib/consultation-api";

const MUTED = "#6b6b63";

const bought = (r: RequestView) => [r.packageTitle, r.addOnTitle].filter(Boolean).join(" + ");
const money = (r: RequestView) => formatMinor(r.amountMinor ?? 0, r.currency ?? "INR");
const first = (r: RequestView) => r.firstName || (r.language === "fr" ? "" : "there");
const when = (r: RequestView, lang: "en" | "fr") =>
  lang === "fr"
    ? `${longDate(r.date, "fr")} à ${slotLabel(r.slot, "fr")} (heure de l’Inde)`
    : `${longDate(r.date, "en")} at ${slotLabel(r.slot, "en")} IST (India Standard Time)`;
const statusUrl = (r: RequestView) =>
  `${siteUrl()}${r.language === "fr" ? "/fr" : ""}/consultation/confirmed?ref=${encodeURIComponent(r.reference)}&t=${encodeURIComponent(r.token)}`;

/** To you: a UPI payment is waiting to be checked. */
function toVerify(r: RequestView, utr: string): Mail {
  const slot = `${longDate(r.date, "en")}, ${slotLabel(r.slot, "en")} IST`;
  return {
    to: { email: notifyAddress() },
    replyTo: { email: r.email, name: r.name },
    subject: `Payment to verify: consultation ${r.reference}, ${money(r)}`,
    html: layout(
      `Payment to verify: ${r.reference}`,
      rows([
        ...(bought(r) ? ([["Package", bought(r)]] as [string, string][]) : []),
        ["Expected amount", money(r)],
        ["UPI reference", utr],
        ["Slot", slot],
        ["Name", r.name],
        ["Email", r.email],
        ["Mobile", r.phone],
      ]) +
        p(
          `<span style="font-size:14px;color:${MUTED};">Check your bank or UPI app for a payment of exactly <strong>${esc(money(r))}</strong> with this reference. If it is there, open the request in Strapi (Consultation Request) and set <strong>Payment status</strong> to <strong>paid</strong>; ${esc(r.firstName || r.name)} is emailed automatically. Then add the meeting link and set the request status to <strong>confirmed</strong> to confirm the slot.</span>`
        ),
      `${r.name} says they paid ${money(r)} for ${slot}. Please verify.`
    ),
    text: `Payment to verify: consultation ${r.reference}\n${bought(r) ? `Package: ${bought(r)}\n` : ""}Expected: ${money(r)}\nUPI reference: ${utr}\nSlot: ${slot}\nName: ${r.name} <${r.email}> ${r.phone}\n\nCheck your bank or UPI app, then set Payment status to "paid" in Strapi (Consultation Request). Then add the meeting link and set the request status to "confirmed".`,
  };
}

/** To the customer: we got their reference and are checking it. */
function verifying(r: RequestView, utr: string): Mail {
  const fr = r.language === "fr";
  const hi = fr ? (first(r) ? `Bonjour ${first(r)},` : "Bonjour,") : `Hi ${first(r)},`;
  const line = fr
    ? `Nous avons bien reçu votre référence de paiement <strong>${esc(utr)}</strong> pour votre consultation du <strong>${esc(when(r, "fr"))}</strong> (${esc(money(r))}). Nous la vérifions et vous écrirons dès que le paiement sera confirmé.`
    : `We’ve received your payment reference <strong>${esc(utr)}</strong> for your consultation on <strong>${esc(when(r, "en"))}</strong> (${esc(money(r))}). We’re checking it and will email you as soon as the payment is confirmed.`;
  const cta = fr ? "Suivre ma consultation" : "Check your consultation";
  const bye = fr ? "Avec bienveillance,<br>Vairutya" : "With care,<br>Vairutya";
  return {
    to: { email: r.email, name: r.name },
    subject: fr ? `Nous vérifions votre paiement (${r.reference})` : `We’re verifying your payment (${r.reference})`,
    html: layout(
      fr ? "Merci, nous vérifions votre paiement" : "Thank you, we’re verifying your payment",
      p(esc(hi)) + p(line) + button(statusUrl(r), cta) + p(bye)
    ),
    text: `${hi}\n\n${r.reference} / ${utr}\n\n${cta}: ${statusUrl(r)}\n\n${fr ? "Avec bienveillance,\nVairutya" : "With care,\nVairutya"}`,
  };
}

/** Razorpay only (for UPI, Strapi sends this when you mark the payment paid). */
function paidCustomer(r: RequestView): Mail {
  const fr = r.language === "fr";
  const hi = fr ? (first(r) ? `Bonjour ${first(r)},` : "Bonjour,") : `Hi ${first(r)},`;
  const line = fr
    ? `Nous avons bien reçu votre paiement de ${money(r)}${bought(r) ? ` (${bought(r)})` : ""} pour la consultation du :`
    : `We’ve received your payment of ${money(r)}${bought(r) ? ` (${bought(r)})` : ""} for your consultation on:`;
  const next = fr
    ? "Nous confirmons votre créneau par e-mail très prochainement, avec le lien de l’appel."
    : "We’ll confirm your slot by email very shortly, with the link to your call.";
  const cta = fr ? "Suivre ma consultation" : "Check your consultation";
  const bye = fr ? "Avec bienveillance,<br>Vairutya" : "With care,<br>Vairutya";
  return {
    to: { email: r.email, name: r.name },
    subject: fr ? `Paiement reçu pour votre consultation (${r.reference})` : `Payment received for your consultation (${r.reference})`,
    html: layout(
      fr ? "Merci, nous avons bien reçu votre paiement" : "Thank you, we’ve received your payment",
      p(esc(hi)) + p(esc(line)) + p(`<strong style="color:#003b43;">${esc(when(r, r.language))}</strong>`) + p(esc(next)) +
        button(statusUrl(r), cta) + p(bye)
    ),
    text: `${hi}\n\n${line}\n${when(r, r.language)}\n\n${next}\n\n${cta}: ${statusUrl(r)}\n\n${fr ? "Avec bienveillance,\nVairutya" : "With care,\nVairutya"}`,
  };
}

/** To you, Razorpay only: a paid booking, ready to confirm. */
function paidOwner(r: RequestView): Mail {
  const slot = `${longDate(r.date, "en")}, ${slotLabel(r.slot, "en")} IST`;
  return {
    to: { email: notifyAddress() },
    replyTo: { email: r.email, name: r.name },
    subject: `New paid consultation: ${slot} (${money(r)})`,
    html: layout(
      "New paid consultation",
      rows([
        ...(bought(r) ? ([["Package", bought(r)]] as [string, string][]) : []),
        ["Paid", money(r)],
        ["Slot", slot],
        ["Name", r.name],
        ["Email", r.email],
        ["Mobile", r.phone],
        ["Reference", r.reference],
      ]) +
        p(`<span style="font-size:14px;color:${MUTED};">This is paid but <strong>not confirmed</strong> yet. Open the request in Strapi (Consultation Request), add the meeting link and set the status to <strong>confirmed</strong>. The customer is then emailed automatically.</span>`),
      `${r.name} paid ${money(r)} for ${slot}.`
    ),
    text: `New paid consultation ${r.reference}\n${bought(r) ? `Package: ${bought(r)}\n` : ""}Paid: ${money(r)}\nSlot: ${slot}\nName: ${r.name} <${r.email}> ${r.phone}\n\nNot confirmed yet: add the meeting link and set the status to "confirmed" in Strapi.`,
  };
}

async function sendAll(label: string, mails: Mail[]) {
  for (const m of mails) {
    try {
      await sendEmail(m);
    } catch (err) {
      console.error(`[consultation] ${label} email failed (the booking is saved in Strapi):`, err);
    }
  }
}

export const sendConsultationPaymentSubmitted = (r: RequestView, utr: string) =>
  sendAll(`payment reference for ${r.reference}`, [toVerify(r, utr), verifying(r, utr)]);

export const sendConsultationPaidEmails = (r: RequestView) =>
  sendAll(`paid for ${r.reference}`, [paidCustomer(r), paidOwner(r)]);
