import { notifyAddress, sendEmail, siteUrl, type Mail } from "@/lib/brevo";
import { formatMinor } from "@/lib/money";
import type { StoredOrder } from "@/lib/orders";
import { esc, layout, p, rows } from "@/lib/email-templates";

const MUTED = "#6b6b63";

function itemsTable(o: StoredOrder) {
  const money = (m: number) => esc(formatMinor(m, o.currency));
  const row = (a: string, b: string, bold = false) =>
    `<tr><td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;${bold ? "font-weight:bold;" : ""}">${a}</td><td align="right" style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;${bold ? "font-weight:bold;" : ""}">${b}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-top:1px solid #e7e1dc;border-bottom:1px solid #e7e1dc;">
${o.items.map((i) => row(`${esc(i.name)} × ${i.qty}`, money(i.lineMinor))).join("")}
${row("Shipping", o.shippingMinor === 0 ? "Free" : money(o.shippingMinor))}
${row("Total", money(o.totalMinor), true)}
</table>
${o.taxIncludedMinor ? `<p style="margin:-8px 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};">Includes GST of ${money(o.taxIncludedMinor)}.</p>` : ""}`;
}

function addressBlock(o: StoredOrder) {
  const a = o.shippingAddress ?? {};
  const lines = [a.name, a.line1, a.line2, [a.postcode, a.city].filter(Boolean).join(" "), a.state, a.country === "FR" ? "France" : "India"]
    .filter(Boolean)
    .map((l) => esc(String(l)))
    .join("<br>");
  return `<p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Shipping to</p>${p(lines)}`;
}

export function customerConfirmation(o: StoredOrder): Mail {
  const first = (o.customerName || "there").split(" ")[0];
  const url = `${siteUrl()}/account/orders/${o.orderNumber}`;
  const money = formatMinor(o.totalMinor, o.currency);
  return {
    to: { email: o.email, name: o.customerName },
    subject: `Your Vairutya order ${o.orderNumber} is confirmed`,
    html: layout(
      "Thank you for your order",
      p(`Hi ${esc(first)},`) +
        p(`We've received your payment of <strong>${esc(money)}</strong> for order <strong>${esc(o.orderNumber)}</strong>. We'll email you again when it ships.`) +
        itemsTable(o) +
        addressBlock(o) +
        `<p style="margin:24px 0;"><a href="${esc(url)}" style="display:inline-block;background:#003b43;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;padding:14px 30px;border-radius:999px;">View your order</a></p>` +
        (o.country === "FR"
          ? p(`<span style="font-size:13px;color:${MUTED};">Parcels sent to France may be subject to import VAT or customs charges on delivery.</span>`)
          : "") +
        p("With care,<br>Vairutya")
    ),
    text: `Hi ${first},\n\nWe've received your payment of ${money} for order ${o.orderNumber}.\n${o.items.map((i) => `- ${i.name} x ${i.qty}`).join("\n")}\n\nView your order: ${url}\n\nWith care,\nVairutya`,
  };
}

export function ownerNotification(o: StoredOrder): Mail {
  const money = formatMinor(o.totalMinor, o.currency);
  const a = o.shippingAddress ?? {};
  return {
    to: { email: notifyAddress() },
    replyTo: { email: o.email, name: o.customerName },
    subject: `New order ${o.orderNumber}: ${money} (paid)`,
    html: layout(
      `New paid order ${o.orderNumber}`,
      p(`<strong>${esc(money)}</strong> from ${esc(o.customerName)} &lt;${esc(o.email)}&gt;${a.phone ? `, phone ${esc(String(a.phone))}` : ""}.`) +
        itemsTable(o) +
        addressBlock(o) +
        p(`<span style="font-size:14px;color:${MUTED};">Pack and ship it, then set the order's status to <strong>shipped</strong> in Strapi (add the carrier and tracking number). The customer is emailed automatically.</span>`)
    ),
    text: `New paid order ${o.orderNumber}: ${money}\nCustomer: ${o.customerName} <${o.email}>\n${o.items.map((i) => `- ${i.name} x ${i.qty}`).join("\n")}\n\nShip it, then set the status to "shipped" in Strapi.`,
  };
}

/** Sent once, the moment an order is first marked paid. A failed email never undoes a payment. */
export async function sendPaidEmails(o: StoredOrder) {
  for (const make of [customerConfirmation, ownerNotification]) {
    try {
      await sendEmail(make(o));
    } catch (err) {
      console.error(`[shop] email for ${o.orderNumber} failed:`, err);
    }
  }
}

/* ------------------------- UPI: payment to verify ------------------------- */

function paymentToVerify(o: StoredOrder, utr: string): Mail {
  const money = formatMinor(o.totalMinor, o.currency);
  return {
    to: { email: notifyAddress() },
    replyTo: { email: o.email, name: o.customerName },
    subject: `Payment to verify: ${o.orderNumber}, ${money}`,
    html: layout(
      `Payment to verify: ${o.orderNumber}`,
      rows([
        ["Expected amount", money],
        ["UPI reference", utr],
        ["Customer", o.customerName],
        ["Email", o.email],
        ["Phone", String(o.shippingAddress?.phone ?? "")],
      ]) +
        p(`<span style="font-size:14px;color:${MUTED};">Check your bank or UPI app for a payment of exactly <strong>${esc(money)}</strong> with this reference. If it is there, open the order in Strapi and set the status to <strong>paid</strong>. The customer is then emailed automatically.</span>`),
      `${o.customerName} says they paid ${money}. Please verify.`
    ),
    text: `Payment to verify: ${o.orderNumber}\nExpected: ${money}\nUPI reference: ${utr}\nCustomer: ${o.customerName} <${o.email}>\n\nCheck your bank or UPI app, then set the order status to "paid" in Strapi.`,
  };
}

function paymentReceivedCustomer(o: StoredOrder, utr: string): Mail {
  const fr = o.language === "fr";
  const first = (o.customerName || "").split(" ")[0] || (fr ? "" : "there");
  const hi = fr ? (first ? `Bonjour ${first},` : "Bonjour,") : `Hi ${first},`;
  const money = formatMinor(o.totalMinor, o.currency);
  const line = fr
    ? `Nous avons bien reçu votre référence de paiement <strong>${esc(utr)}</strong> pour la commande <strong>${esc(o.orderNumber)}</strong> (${esc(money)}). Nous la vérifions et vous écrirons dès que le paiement sera confirmé.`
    : `We've received your payment reference <strong>${esc(utr)}</strong> for order <strong>${esc(o.orderNumber)}</strong> (${esc(money)}). We're checking it and will email you as soon as the payment is confirmed.`;
  const subject = fr ? `Nous vérifions votre paiement (${o.orderNumber})` : `We're verifying your payment (${o.orderNumber})`;
  const heading = fr ? "Merci, nous vérifions votre paiement" : "Thank you, we're verifying your payment";
  const bye = fr ? "Avec bienveillance,<br>Vairutya" : "With care,<br>Vairutya";
  return {
    to: { email: o.email, name: o.customerName },
    subject,
    html: layout(heading, p(esc(hi)) + p(line) + p(bye)),
    text: `${hi}\n\n${o.orderNumber} / ${utr}\n\n${fr ? "Avec bienveillance,\nVairutya" : "With care,\nVairutya"}`,
  };
}

/** Best effort: a failed email never loses the customer's reference, which is saved in Strapi. */
export async function sendPaymentSubmittedEmails(o: StoredOrder, utr: string) {
  for (const make of [() => paymentToVerify(o, utr), () => paymentReceivedCustomer(o, utr)]) {
    try {
      await sendEmail(make());
    } catch (err) {
      console.error(`[shop] email for ${o.orderNumber} failed:`, err);
    }
  }
}
