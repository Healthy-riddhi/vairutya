import { SKIN_SEQUENCES, type DripBlock, type DripEmail, type SkinSequence } from "@/lib/skin-sequences";
import { siteUrl, type Mail } from "@/lib/brevo";
import { button, esc, layout, p } from "@/lib/email-templates";

const DOSHAS = ["vata", "pitta", "kapha"] as const;
const MUTED = "#6b6b63";

/**
 * Which set of emails a quiz result gets. `outcomeNames` are the winning outcome(s) of the quiz:
 * one name is a single dosha, two is a combination (a tie), all three is tridoshic.
 * Returns null if the names aren't Vata / Pitta / Kapha, so a differently-built quiz sends nothing.
 */
export function sequenceFor(outcomeNames: string[]): SkinSequence | null {
  const found = outcomeNames.map((n) => DOSHAS.find((d) => n.toLowerCase().includes(d)));
  if (found.some((d) => !d)) return null;
  const set = new Set(found as (typeof DOSHAS)[number][]);
  if (set.size === 3) return "tridoshic";
  if (set.size === 1) return [...set][0];
  if (set.has("vata") && set.has("pitta")) return "vata-pitta";
  if (set.has("vata") && set.has("kapha")) return "vata-kapha";
  return "pitta-kapha";
}

export function getDripEmail(sequence: SkinSequence, step: number): DripEmail | undefined {
  return SKIN_SEQUENCES[sequence]?.find((e) => e.step === step);
}

/** Escapes the text, then turns **bold** into <strong>. */
const inline = (md: string) => esc(md).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
const plainText = (md: string) => md.replace(/\*\*/g, "");

const LIST = `margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.7;`;
function blockHtml(b: DripBlock): string {
  if ("p" in b) return p(inline(b.p));
  const tag = "ul" in b ? "ul" : "ol";
  const items = "ul" in b ? b.ul : b.ol;
  return `<${tag} style="${LIST}">${items.map((i) => `<li style="margin:0 0 10px;">${inline(i)}</li>`).join("")}</${tag}>`;
}
function blockText(b: DripBlock): string {
  if ("p" in b) return plainText(b.p);
  if ("ul" in b) return b.ul.map((i) => `• ${plainText(i)}`).join("\n");
  return b.ol.map((i, n) => `${n + 1}. ${plainText(i)}`).join("\n");
}

/** One email of a skin sequence, addressed to this person, with an unsubscribe link. */
export function buildDripEmail(opts: {
  sequence: SkinSequence;
  step: number;
  email: string;
  firstName: string;
  token: string;
}): Mail | null {
  const e = getDripEmail(opts.sequence, opts.step);
  if (!e) return null;
  const first = opts.firstName.trim().split(/\s+/)[0] || "friend";
  const page = `${siteUrl()}/unsubscribe?t=${encodeURIComponent(opts.token)}`;
  const oneClick = `${siteUrl()}/api/unsubscribe?t=${encodeURIComponent(opts.token)}`;

  const html = layout(
    e.subject,
    p(`Dear ${esc(first)},`) +
      e.blocks.map(blockHtml).join("") +
      p(`Warmly,<br>Riddhi<br>The Vairutya Studio`) +
      button(siteUrl(), "Visit Vairutya") +
      `<p style="margin:28px 0 0;padding-top:18px;border-top:1px solid #e7e1dc;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:${MUTED};">You are receiving this because you took the skin quiz on Vairutya and asked to hear from us. <a href="${esc(page)}" style="color:${MUTED};">Unsubscribe</a></p>`,
    e.preview
  );
  const text = [
    `Dear ${first},`,
    "",
    ...e.blocks.map(blockText).flatMap((t) => [t, ""]),
    "Warmly,",
    "Riddhi",
    "The Vairutya Studio",
    "",
    "---",
    "You are receiving this because you took the skin quiz on Vairutya and asked to hear from us.",
    `Unsubscribe: ${page}`,
  ].join("\n");

  return {
    to: { email: opts.email, name: opts.firstName || undefined },
    subject: e.subject,
    html,
    text,
    headers: {
      "List-Unsubscribe": `<${oneClick}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
