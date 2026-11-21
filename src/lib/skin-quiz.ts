import { SKIN_SEQUENCES, type DripBlock, type DripEmail, type SkinSequence } from "@/lib/skin-sequences";
import { button, esc, layout, p } from "@/lib/email-templates";

const DOSHAS = ["vata", "pitta", "kapha"] as const;
export const SEQUENCE_KEYS = Object.keys(SKIN_SEQUENCES) as SkinSequence[];

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

/**
 * The Brevo list for each skin result, from BREVO_SKIN_LISTS, e.g.
 *   vata:11,pitta:12,kapha:13,vata-pitta:14,vata-kapha:15,pitta-kapha:16,tridoshic:17
 * Each list has its own Brevo automation ("contact added to this list" → the five emails).
 */
export function skinLists(): Partial<Record<SkinSequence, number>> {
  const out: Partial<Record<SkinSequence, number>> = {};
  for (const part of (process.env.BREVO_SKIN_LISTS ?? "").split(",")) {
    const [key, id] = part.split(":").map((s) => s.trim());
    const n = Number(id);
    if ((SEQUENCE_KEYS as string[]).includes(key) && Number.isInteger(n) && n > 0) out[key as SkinSequence] = n;
  }
  return out;
}

/** The list for this result and the other skin lists, or null if the lists aren't set up (yet). */
export function skinTarget(sequence: SkinSequence): { type: SkinSequence; listId: number; otherListIds: number[] } | null {
  const lists = skinLists();
  const listId = lists[sequence];
  if (!listId) return null;
  return { type: sequence, listId, otherListIds: Object.values(lists).filter((id): id is number => !!id && id !== listId) };
}

/* ------------- the emails, as HTML to paste into Brevo (see scripts/export-skin-emails.ts) ------------- */

/** Escapes the text, then turns **bold** into <strong>. */
const inline = (md: string) => esc(md).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

const LIST = "margin:0 0 16px;padding-left:22px;font-size:16px;line-height:1.7;";
function blockHtml(b: DripBlock): string {
  if ("p" in b) return p(inline(b.p));
  const tag = "ul" in b ? "ul" : "ol";
  const items = "ul" in b ? b.ul : b.ol;
  return `<${tag} style="${LIST}">${items.map((i) => `<li style="margin:0 0 10px;">${inline(i)}</li>`).join("")}</${tag}>`;
}

/**
 * One email as a complete HTML page for Brevo, in the same look as the site's other emails. It uses
 * Brevo's own tags: {{ contact.FIRSTNAME }} for the name and {{ unsubscribe }} for the unsubscribe
 * link (Brevo requires one in every marketing email).
 */
export function brevoEmailHtml(e: DripEmail): string {
  return layout(
    e.subject,
    p("Dear {{ contact.FIRSTNAME }},") +
      e.blocks.map(blockHtml).join("") +
      p("Warmly,<br>Riddhi<br>The Vairutya Studio") +
      button("https://www.vairutya.com", "Visit Vairutya") +
      `<p style="margin:28px 0 0;padding-top:18px;border-top:1px solid #e7e1dc;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#6b6b63;">You are receiving this because you took the skin quiz on Vairutya and asked to hear from us. <a href="{{ unsubscribe }}" style="color:#6b6b63;">Unsubscribe</a></p>`,
    e.preview
  );
}

/** Days after joining the list that each email goes out, and how long to wait before each one. */
export const SCHEDULE = [
  { step: 1, day: 3, wait: "3 days" },
  { step: 2, day: 7, wait: "4 days" },
  { step: 3, day: 10, wait: "3 days" },
  { step: 4, day: 14, wait: "4 days" },
  { step: 5, day: 21, wait: "7 days" },
];

/** A readable name for each result, used for the Brevo list and file names. */
export const SEQUENCE_LABEL: Record<SkinSequence, string> = {
  vata: "Vata",
  pitta: "Pitta",
  kapha: "Kapha",
  "vata-pitta": "Vata-Pitta",
  "vata-kapha": "Vata-Kapha",
  "pitta-kapha": "Pitta-Kapha",
  tridoshic: "Tridoshic",
};
