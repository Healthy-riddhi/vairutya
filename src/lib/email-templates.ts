import type { Mail } from "@/lib/brevo";
import { oneLine } from "@/lib/api-utils";

/** Escape text before putting it in HTML. Everything visitors type goes through this. */
export const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const INK = "#1c1c1c";
const TEAL = "#003b43";
const CLAY = "#9b4a3a";
const MUTED = "#6b6b63";

/**
 * The one shared look for every email sent from the website.
 * `preheader` is the short preview text shown beside the subject in the inbox.
 */
export function layout(heading: string, inner: string, preheader = ""): string {
  const hidden = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${esc(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
    : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:32px 16px;background:#f5f1ea;font-family:Georgia,'Times New Roman',serif;color:${INK};">
${hidden}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;">
    <tr><td style="padding:40px 36px 36px;">
      <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.3em;color:${CLAY};">VAIRUTYA</p>
      <div style="width:28px;height:2px;background:${TEAL};margin:0 0 26px;"></div>
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:normal;line-height:1.25;color:${TEAL};">${esc(heading)}</h1>
      ${inner}
    </td></tr>
  </table>
  <p style="margin:20px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};">Vairutya · <a href="https://www.vairutya.com" style="color:${MUTED};">www.vairutya.com</a></p>
</td></tr></table>
</body></html>`;
}

export const p = (html: string) =>
  `<p style="margin:0 0 16px;font-size:16px;line-height:1.7;">${html}</p>`;

export function button(href: string, label: string): string {
  return `<p style="margin:28px 0;"><a href="${esc(href)}" style="display:inline-block;background:${TEAL};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.06em;padding:14px 28px;border-radius:999px;">${esc(label)}</a></p>`;
}

export function rows(items: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-top:1px solid #e7e1dc;">${items
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 0;border-bottom:1px solid #e7e1dc;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};width:130px;vertical-align:top;">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid #e7e1dc;font-size:15px;line-height:1.6;vertical-align:top;white-space:pre-wrap;">${esc(v)}</td></tr>`
    )
    .join("")}</table>`;
}

/** "2026-11-04" → "Wednesday, 4 November" (no time-zone drift). */
export function dateLabel(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

/* ------------------------------------------------------------------ */

export function recipeEmail(opts: {
  name: string;
  email: string;
  recipeTitle: string;
  pdfUrl: string;
}): Mail {
  const first = oneLine(opts.name).split(" ")[0] || "there";
  return {
    to: { email: opts.email, name: oneLine(opts.name) },
    subject: `Your free recipe: ${opts.recipeTitle}`,
    html: layout(
      opts.recipeTitle,
      p(`Hi ${esc(first)},`) +
        p(`Here is your free PDF of <strong>${esc(opts.recipeTitle)}</strong>, with the ingredients, directions and the Ayurvedic notes behind it.`) +
        button(opts.pdfUrl, "Download the recipe (PDF)") +
        p(`<span style="font-size:14px;color:${MUTED};">If the button doesn’t work, copy this link into your browser:<br>${esc(opts.pdfUrl)}</span>`) +
        p("With care,<br>Vairutya"),
      `Your PDF of ${opts.recipeTitle} is ready to download.`
    ),
    text: `Hi ${first},\n\nHere is your free PDF of ${opts.recipeTitle}:\n${opts.pdfUrl}\n\nWith care,\nVairutya`,
  };
}

export function contactNotification(opts: {
  to: string;
  name: string;
  email: string;
  message: string;
}): Mail {
  return {
    to: { email: opts.to },
    replyTo: { email: opts.email, name: oneLine(opts.name) },
    subject: `New message from ${oneLine(opts.name)}`,
    html: layout(
      "New contact message",
      rows([
        ["Name", opts.name],
        ["Email", opts.email],
        ["Message", opts.message],
      ]) + p(`<span style="font-size:14px;color:${MUTED};">Reply to this email to answer ${esc(oneLine(opts.name))} directly.</span>`),
      `${oneLine(opts.name)} wrote to you through the website.`
    ),
    text: `New message from ${opts.name} <${opts.email}>\n\n${opts.message}\n\n(Reply to this email to answer them directly.)`,
  };
}

export type QuizSubmission = {
  to: string;
  quizTitle: string;
  quizSlug: string;
  language: string;
  firstName: string;
  email: string;
  ageGroup: string;
  identity: string;
  country: string;
  motivation: string;
  newsletter: boolean;
  /** Outcome names with their share of the answers, e.g. { name: "Vata", percent: 44 }. */
  balance: { name: string; percent: number }[];
  /** The outcome(s) that won. More than one means a tie. */
  winners: string[];
  /** One entry per question, in order. */
  answers: { question: string; answer: string; outcome: string }[];
};

/** Quiz finished → an email to the team with the person's details, result and every answer. */
export function quizNotification(q: QuizSubmission): Mail {
  const when = `${new Date().toLocaleString("en-GB", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} IST`;
  const result = q.winners.join(" + ");
  const balance = q.balance.map((b) => `${b.name} ${b.percent}%`).join("  ·  ");
  const none = "—";
  const details: [string, string][] = [
    ["Name", q.firstName],
    ["Email", q.email],
    ["Age group", q.ageGroup || none],
    ["Gender", q.identity || none],
    ["Country", q.country || none],
    ...(q.motivation ? ([["Motivation", q.motivation]] as [string, string][]) : []),
    ["Newsletter", q.newsletter ? "Yes, they ticked the box (confirmation email sent to them)" : "No"],
    ["Language", q.language],
    ["Submitted", when],
  ];
  const resultRows: [string, string][] = [
    ["Quiz", q.quizTitle],
    ["Result", result],
    ["Balance", balance],
  ];
  const answerRows = q.answers
    .map(
      (a, i) =>
        `<tr><td style="padding:10px 12px 10px 0;border-bottom:1px solid #e7e1dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};vertical-align:top;width:26px;">${i + 1}</td><td style="padding:10px 0;border-bottom:1px solid #e7e1dc;font-size:14px;line-height:1.55;vertical-align:top;"><span style="color:${MUTED};">${esc(a.question)}</span><br><strong>${esc(a.answer)}</strong> <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${CLAY};">(${esc(a.outcome)})</span></td></tr>`
    )
    .join("");
  const h = (t: string) =>
    `<p style="margin:26px 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${CLAY};">${esc(t)}</p>`;

  const text = [
    `New quiz result: ${q.quizTitle}`,
    "",
    `Result: ${result}`,
    `Balance: ${balance}`,
    "",
    ...details.map(([k, v]) => `${k}: ${v}`),
    "",
    "Answers:",
    ...q.answers.map((a, i) => `${i + 1}. ${a.question}\n   → ${a.answer} (${a.outcome})`),
    "",
    "(Reply to this email to write to them directly.)",
  ].join("\n");

  return {
    to: { email: q.to },
    replyTo: { email: q.email, name: oneLine(q.firstName) },
    subject: `New quiz result: ${oneLine(q.quizTitle)} — ${oneLine(q.firstName)} (${oneLine(result)})`,
    html: layout(
      "New quiz result",
      rows(resultRows) +
        h("About them") +
        rows(details) +
        h("Their answers") +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-top:1px solid #e7e1dc;">${answerRows}</table>` +
        p(`<span style="font-size:14px;color:${MUTED};">Reply to this email to write to ${esc(oneLine(q.firstName))} directly.</span>`),
      `${oneLine(q.firstName)} finished the ${oneLine(q.quizTitle)} quiz: ${result}.`
    ),
    text,
  };
}

export type Booking = {
  name: string;
  email: string;
  phone: string;
  concern: string;
  date: string; // YYYY-MM-DD
  slot: string;
};

export function bookingNotification(to: string, b: Booking): Mail {
  const when = `${dateLabel(b.date)}, ${b.slot}`;
  return {
    to: { email: to },
    replyTo: { email: b.email, name: oneLine(b.name) },
    subject: `New consultation request: ${when}`,
    html: layout(
      "New consultation request",
      rows([
        ["When", when],
        ["Name", b.name],
        ["Email", b.email],
        ["Mobile", b.phone],
        ["Main concern", b.concern || "—"],
      ]) +
        p(`<span style="font-size:14px;color:${MUTED};">This slot is <strong>not confirmed</strong> yet. To confirm it, open the request in Strapi (Consultation Request), check the date and time, and set the status to <strong>confirmed</strong>. ${esc(oneLine(b.name))} is then emailed automatically.</span>`),
      `${oneLine(b.name)} would like ${when}. Reply to confirm.`
    ),
    text: `New consultation request\n\nWhen: ${when}\nName: ${b.name}\nEmail: ${b.email}\nMobile: ${b.phone}\nMain concern: ${b.concern || "-"}\n\nThis slot is NOT confirmed yet. To confirm it, open the request in Strapi (Consultation Request) and set the status to "confirmed". The customer is then emailed automatically.`,
  };
}

export function bookingConfirmation(
  b: Booking,
  opts: { locale: "en" | "fr"; statusUrl: string; when: string }
): Mail {
  const fr = opts.locale === "fr";
  const first = oneLine(b.name).split(" ")[0] || (fr ? "" : "there");
  const hi = fr ? (first ? `Bonjour ${first},` : "Bonjour,") : `Hi ${first},`;
  const subject = fr ? "Nous avons bien reçu votre demande de consultation" : "We’ve received your consultation request";
  const heading = fr ? "Merci, nous avons bien reçu votre demande" : "Thank you, we’ve got your request";
  const asked = fr ? "Vous avez demandé une consultation le" : "You asked for a consultation on";
  const next = fr
    ? "Nous confirmerons votre créneau par e-mail sous peu. Si cet horaire ne nous convient pas, nous vous proposerons l’alternative la plus proche."
    : "We’ll confirm your slot by email shortly. If that time doesn’t work for us, we’ll suggest the closest alternative.";
  const cta = fr ? "Suivre ma demande" : "Check your request status";
  const bye = fr ? "Avec bienveillance,<br>Vairutya" : "With care,<br>Vairutya";
  const byeText = fr ? "Avec bienveillance,\nVairutya" : "With care,\nVairutya";

  return {
    to: { email: b.email, name: oneLine(b.name) },
    subject,
    html: layout(
      heading,
      p(esc(hi)) +
        p(`${esc(asked)} <strong>${esc(opts.when)}</strong>.`) +
        p(esc(next)) +
        button(opts.statusUrl, cta) +
        p(bye),
      opts.when
    ),
    text: `${hi}\n\n${asked} ${opts.when}.\n\n${next}\n\n${cta}: ${opts.statusUrl}\n\n${byeText}`,
  };
}
