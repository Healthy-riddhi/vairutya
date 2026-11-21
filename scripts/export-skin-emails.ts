/**
 * Writes the 5 skin-quiz emails as HTML files, ready to paste into Brevo, plus an index with the steps.
 * Each file holds the version for every skin type; Brevo shows each person the one that matches their result.
 *
 * Run it from the project folder:   npx tsx scripts/export-skin-emails.ts
 * It creates a folder called  skin-emails/  (safe to delete afterwards; run it again any time the
 * wording in src/lib/skin-sequences.ts changes, then paste the new HTML into the same Brevo emails).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { SKIN_SEQUENCES } from "../src/lib/skin-sequences";
import { SCHEDULE, SEQUENCE_KEYS, SEQUENCE_LABEL, brevoStepHtml } from "../src/lib/skin-quiz";

const out = join(process.cwd(), "skin-emails");
mkdirSync(out, { recursive: true });

const rows: string[] = [];
for (const s of SCHEDULE) {
  const file = `skin-email-${s.step}-day${s.day}.html`;
  writeFileSync(join(out, file), brevoStepHtml(s.step), "utf8");
  rows.push(`| ${s.step} | ${s.wait} | ${s.day} | ${file} | {{ contact.SKIN_SUBJECT_${s.step} }} |`);
}

const index = [
  "# Skin quiz emails for Brevo: one automation, five emails",
  "",
  "## The automation",
  "",
  "1. **Entry point:** Contact is added to a list, and select **all seven** lists: " + SEQUENCE_KEYS.map((k) => `Skin quiz – ${SEQUENCE_LABEL[k]}`).join(", ") + ".",
  "2. Then, in this order (each wait counts from the previous email):",
  "",
  "| Email | Wait before | Sent on day | HTML file to paste | Subject line to type |",
  "|---|---|---|---|---|",
  ...rows,
  "",
  "In each **Send an email** step: paste the HTML file into the HTML custom code editor, type the subject line exactly as shown",
  "(Brevo fills it in from each person's contact), choose your sender, then use **Preview & test**.",
  "",
  "When you activate the automation, tick **Re-entry after exit** if you see it.",
  "",
  "## What each person gets",
  "",
  ...SEQUENCE_KEYS.flatMap((k) => [`### ${SEQUENCE_LABEL[k]}`, ...SKIN_SEQUENCES[k].map((e) => `${e.step}. ${e.subject}`), ""]),
];
writeFileSync(join(out, "INDEX.md"), index.join("\n"), "utf8");
console.log(`Wrote ${SCHEDULE.length} emails and INDEX.md to ${out}`);
